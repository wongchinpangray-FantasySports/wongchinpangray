import tentativeData from "@/data/cps-tentative.json";
import { CPS_HOLIDAYS, subtractWorkdays } from "@/lib/cps";

export type PaceMode = "standard" | "accelerated";

export type TentativeStepInput = {
  title: string;
  leadTimeDays: number | null;
  leadTimeRaw: string | null;
  adjustable: boolean;
  ownerRole: string | null;
  notes: string | null;
  weekLabel: string | null;
};

export type TentativeStep = TentativeStepInput & {
  id: string;
  endDate: string;
  leadTimeApplied: number;
  acceleratedFrom?: number | null;
};

export type TentativePlan = {
  cpsType: string;
  cpsName: string;
  pace: PaceMode;
  sosDate: string;
  projectName: string;
  briefDate: string;
  steps: TentativeStep[];
  sourceFile: string;
  accelerationNote: string;
};

type TentativeTemplate = {
  id: string;
  name: string;
  sheetName: string;
  meta: Record<string, string | null>;
  steps: TentativeStepInput[];
  holidays: string[];
};

const DATA = tentativeData as {
  sourceFile: string;
  acceleration: {
    description: string;
    ctmzSpecialByTitle: Record<string, number>;
    designUrgent: {
      firstLayout?: number;
      revision?: number;
      fa?: number;
    };
  };
  templates: TentativeTemplate[];
};

export function listTentativeTypes() {
  return DATA.templates.map((t) => ({
    id: t.id,
    name: t.name,
    sheetName: t.sheetName,
    stepCount: t.steps.length,
  }));
}

export function getTentativeTemplate(id: string) {
  return DATA.templates.find((t) => t.id === id) ?? null;
}

function holidaySet(template: TentativeTemplate) {
  return new Set([...CPS_HOLIDAYS, ...template.holidays]);
}

function resolveLeadDays(
  template: TentativeTemplate,
  step: TentativeStepInput,
  pace: PaceMode,
): { applied: number; acceleratedFrom: number | null } {
  const base = step.leadTimeDays ?? 0;
  if (pace === "standard") {
    return { applied: base, acceleratedFrom: null };
  }

  // Accelerated rules from workbook only
  let accelerated: number | null = null;

  if (template.id === "ctmz-normal") {
    const special = DATA.acceleration.ctmzSpecialByTitle[step.title];
    if (typeof special === "number") accelerated = special;
  }

  const title = step.title.toLowerCase();
  const urgent = DATA.acceleration.designUrgent;
  if (/1st layout/i.test(step.title) && typeof urgent.firstLayout === "number") {
    accelerated =
      accelerated == null
        ? urgent.firstLayout
        : Math.min(accelerated, urgent.firstLayout);
  } else if (
    (/layout submission|revision/i.test(title) || /^nth revision/i.test(title)) &&
    typeof urgent.revision === "number" &&
    !/1st layout/i.test(step.title)
  ) {
    accelerated =
      accelerated == null
        ? urgent.revision
        : Math.min(accelerated, urgent.revision);
  } else if (/file output/i.test(title) && typeof urgent.fa === "number") {
    accelerated =
      accelerated == null ? urgent.fa : Math.min(accelerated, urgent.fa);
  }

  if (accelerated == null) {
    return { applied: base, acceleratedFrom: null };
  }
  // Never lengthen vs sheet standard when accelerating
  const applied =
    step.leadTimeDays == null
      ? accelerated
      : Math.min(step.leadTimeDays, accelerated);
  return { applied, acceleratedFrom: step.leadTimeDays };
}

/** Back-calculate end dates from SOS using sequential workday lead times. */
export function generateTentativePlan(opts: {
  cpsType: string;
  sosDate: string;
  pace?: PaceMode;
  projectName?: string;
}): TentativePlan {
  const template = getTentativeTemplate(opts.cpsType);
  if (!template) throw new Error("Unknown CPS type");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(opts.sosDate)) {
    throw new Error("SOS date must be YYYY-MM-DD");
  }

  const pace = opts.pace === "accelerated" ? "accelerated" : "standard";
  const holidays = holidaySet(template);
  const resolved = template.steps.map((step, index) => {
    const { applied, acceleratedFrom } = resolveLeadDays(template, step, pace);
    return {
      ...step,
      id: `step-${index}`,
      leadTimeApplied: applied,
      acceleratedFrom,
      endDate: opts.sosDate, // filled below
    };
  });

  if (resolved.length === 0) throw new Error("Template has no steps");

  // Last step ends on SOS
  resolved[resolved.length - 1].endDate = opts.sosDate;
  for (let i = resolved.length - 1; i > 0; i--) {
    const lead = resolved[i].leadTimeApplied;
    resolved[i - 1].endDate = subtractWorkdays(
      resolved[i].endDate,
      lead,
      holidays,
    );
  }

  return {
    cpsType: template.id,
    cpsName: template.name,
    pace,
    sosDate: opts.sosDate,
    projectName: opts.projectName?.trim() || `${template.name} tentative CPS`,
    briefDate: resolved[0]?.endDate ?? opts.sosDate,
    steps: resolved,
    sourceFile: DATA.sourceFile,
    accelerationNote: DATA.acceleration.description,
  };
}

/** Recompute end dates after user edits lead times (still anchored to SOS). */
export function rescheduleFromSos(
  plan: TentativePlan,
  steps: Array<Pick<TentativeStep, "id" | "leadTimeApplied" | "endDate"> & TentativeStepInput>,
): TentativeStep[] {
  const template = getTentativeTemplate(plan.cpsType);
  const holidays = holidaySet(
    template ?? { holidays: [], id: "", name: "", sheetName: "", meta: {}, steps: [] },
  );
  const next = steps.map((s) => ({ ...s }));
  if (!next.length) return next;
  next[next.length - 1].endDate = plan.sosDate;
  for (let i = next.length - 1; i > 0; i--) {
    next[i - 1].endDate = subtractWorkdays(
      next[i].endDate,
      Math.max(0, next[i].leadTimeApplied || 0),
      holidays,
    );
  }
  return next;
}

export function tentativeToWorkbook(plan: TentativePlan) {
  const rows: Array<Array<string | number | null>> = [
    [plan.projectName, null, null, null, null],
    ["Target SOS date", plan.sosDate, null, null, null],
    ["CPS type", plan.cpsName, null, null, null],
    ["Pace", plan.pace === "accelerated" ? "Accelerated" : "Standard", null, null, null],
    ["Source", plan.sourceFile, null, null, null],
    [],
    ["Step", "Lead Time", "End Date", "Task Owner", "Actions / Notes"],
  ];
  for (const s of plan.steps) {
    rows.push([
      s.title,
      s.leadTimeApplied,
      s.endDate,
      s.ownerRole,
      s.notes,
    ]);
  }
  return rows;
}
