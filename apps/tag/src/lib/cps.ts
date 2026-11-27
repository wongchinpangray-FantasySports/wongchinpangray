import cpsData from "@/data/cps-templates.json";

export type CpsStep = {
  title: string;
  leadTimeDays: number;
  endDateSample: string | null;
  ownerRole: string | null;
  notes: string | null;
  offsetDaysFromBrief: number;
};

export type CpsMilestone = {
  title: string;
  weekLabel: string | null;
  steps: CpsStep[];
};

export type CpsTemplate = {
  id: string;
  name: string;
  sheetName: string;
  metaFields: Record<string, string | null>;
  milestones: CpsMilestone[];
  stepCount: number;
  milestoneCount: number;
};

export const CPS_TEMPLATES = cpsData.templates as unknown as CpsTemplate[];
export const CPS_HOLIDAYS = new Set(cpsData.holidays as string[]);

export function listCpsTemplates() {
  return CPS_TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    sheetName: t.sheetName,
    milestoneCount: t.milestoneCount,
    stepCount: t.stepCount,
    metaFields: t.metaFields,
  }));
}

export function getCpsTemplate(id: string) {
  return CPS_TEMPLATES.find((t) => t.id === id) ?? null;
}

function parseYmd(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatYmd(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Add N working days (Mon–Fri), skipping holidays from the CPS workbook. */
export function addWorkdays(startYmd: string, workdays: number) {
  if (workdays <= 0) return startYmd;
  const d = parseYmd(startYmd);
  let left = workdays;
  while (left > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const day = d.getUTCDay(); // 0 Sun .. 6 Sat
    const ymd = formatYmd(d);
    if (day === 0 || day === 6) continue;
    if (CPS_HOLIDAYS.has(ymd)) continue;
    left -= 1;
  }
  return formatYmd(d);
}

export function scheduleFromBrief(briefDate: string, offsetWorkdays: number) {
  return addWorkdays(briefDate, offsetWorkdays);
}

export const CPS_COLORS: Record<string, string> = {
  "ctmz-normal": "#1B7A4E",
  "ctmz-special": "#0C4A6E",
  "posm-mockup": "#B45309",
  "posm-no-mockup": "#0F766E",
};
