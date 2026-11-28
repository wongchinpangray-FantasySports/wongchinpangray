import * as XLSX from "xlsx";
import type { CpsMilestone, CpsStep, CpsTemplate } from "@/lib/cps";

const KNOWN_SHEETS: Array<{ match: RegExp; id: string; name: string }> = [
  { match: /^CTMZ\s*\(\s*Normal\s*\)\s*$/i, id: "ctmz-normal", name: "CTMZ (Normal)" },
  { match: /^CTMZ\s*\(\s*Special\s*\)\s*$/i, id: "ctmz-special", name: "CTMZ (Special)" },
  {
    match: /^POSM\s*\(\s*Mock\s*up\s*needed\s*\)\s*$/i,
    id: "posm-mockup",
    name: "POSM (Mock up needed)",
  },
  {
    match: /^POSM\s*\(\s*No\s*Mock\s*up\s*\)\s*$/i,
    id: "posm-no-mockup",
    name: "POSM (No Mock up)",
  },
];

const POSM_PHASE_STARTS = new Set([
  "Brief in",
  "Design PM Setup & Briefing",
  "1st Layout submission",
  "Client confirm output for Mock up",
  "Client confirm Structure for White mock up",
  "Client confirm output for Mock up (2nd round)",
  "ABM confirm output for Color proof",
  "Send to KA for approval",
  "File Output & Starts production",
  "Delivery to Warehouse",
  "SOS Date",
]);

function cellStr(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  return s || null;
}

function cellDate(v: unknown): string | null {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10);
  }
  if (typeof v === "number") {
    // Excel serial date
    const parsed = XLSX.SSF.parse_date_code(v);
    if (parsed) {
      const mm = String(parsed.m).padStart(2, "0");
      const dd = String(parsed.d).padStart(2, "0");
      return `${parsed.y}-${mm}-${dd}`;
    }
  }
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)) {
    return v.slice(0, 10);
  }
  return null;
}

function cellLead(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
}

type RawStep = {
  title: string;
  leadTimeDays: number;
  endDateSample: string | null;
  ownerRole: string | null;
  notes: string | null;
  weekLabel: string | null;
};

function findHeaderRow(rows: unknown[][]): number {
  for (let i = 0; i < Math.min(rows.length, 30); i++) {
    const a = cellStr(rows[i]?.[0]);
    const b = cellStr(rows[i]?.[1]);
    const c = cellStr(rows[i]?.[2]);
    const d = cellStr(rows[i]?.[3]);
    if (
      a?.toLowerCase() === "step" &&
      b?.toLowerCase().includes("lead") &&
      (c?.toLowerCase().includes("end") || d?.toLowerCase().includes("owner"))
    ) {
      return i;
    }
    // looser: Step + Lead Time
    if (a?.toLowerCase() === "step" && b && /lead/i.test(b)) return i;
  }
  return -1;
}

function parseSheetRows(sheetName: string, rows: unknown[][]): CpsTemplate | null {
  const headerRow = findHeaderRow(rows);
  if (headerRow < 0) return null;

  const metaFields: Record<string, string | null> = {};
  for (let i = 0; i < headerRow; i++) {
    const k = cellStr(rows[i]?.[0]);
    if (!k) continue;
    const raw = rows[i]?.[1];
    metaFields[k] = cellDate(raw) ?? cellStr(raw);
  }

  const steps: RawStep[] = [];
  for (let i = headerRow + 1; i < rows.length; i++) {
    const titleRaw = rows[i]?.[0];
    if (titleRaw instanceof Date) break;
    const title = cellStr(titleRaw);
    if (!title) {
      const next = cellStr(rows[i + 1]?.[0]);
      if (!next || /holiday/i.test(next)) break;
      continue;
    }
    if (/holiday/i.test(title)) break;

    steps.push({
      title,
      leadTimeDays: cellLead(rows[i]?.[1]),
      endDateSample: cellDate(rows[i]?.[2]),
      ownerRole: cellStr(rows[i]?.[3]),
      notes: cellStr(rows[i]?.[4]),
      weekLabel: cellStr(rows[i]?.[5]),
    });
  }

  if (steps.length === 0) return null;

  const milestones = groupMilestones(steps);
  let cum = 0;
  for (const m of milestones) {
    for (const s of m.steps) {
      cum += Math.max(0, s.leadTimeDays || 0);
      s.offsetDaysFromBrief = cum;
    }
  }

  const known = KNOWN_SHEETS.find((k) => k.match.test(sheetName.trim()));
  const id =
    known?.id ??
    `upload-${sheetName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48)}`;

  return {
    id,
    name: known?.name ?? sheetName.trim(),
    sheetName,
    metaFields,
    milestones,
    stepCount: milestones.reduce((n, m) => n + m.steps.length, 0),
    milestoneCount: milestones.length,
  };
}

function groupMilestones(steps: RawStep[]): CpsMilestone[] {
  const hasWeek = steps.some((s) => s.weekLabel);
  if (hasWeek) {
    const milestones: CpsMilestone[] = [];
    let current: CpsMilestone | null = null;
    for (const s of steps) {
      if (s.weekLabel) {
        current = {
          title: `${s.weekLabel} — ${s.title}`,
          weekLabel: s.weekLabel,
          steps: [],
        };
        milestones.push(current);
      }
      if (!current) {
        current = { title: steps[0].title, weekLabel: null, steps: [] };
        milestones.push(current);
      }
      current.steps.push(toStep(s));
    }
    return milestones.filter((m) => m.steps.length > 0);
  }

  const milestones: CpsMilestone[] = [];
  let current: CpsMilestone | null = null;
  for (const s of steps) {
    const isPhase =
      POSM_PHASE_STARTS.has(s.title) ||
      s.title.startsWith("Client confirm output for Mock up") ||
      s.title.startsWith("Client confirm Structure for White mock up");
    if (isPhase && (!current || current.title !== s.title)) {
      current = { title: s.title, weekLabel: null, steps: [] };
      milestones.push(current);
    }
    if (!current) {
      current = { title: s.title, weekLabel: null, steps: [] };
      milestones.push(current);
    }
    current.steps.push(toStep(s));
  }
  return milestones.filter((m) => m.steps.length > 0);
}

function toStep(s: RawStep): CpsStep {
  return {
    title: s.title,
    leadTimeDays: s.leadTimeDays,
    endDateSample: s.endDateSample,
    ownerRole: s.ownerRole,
    notes: s.notes,
    offsetDaysFromBrief: 0,
  };
}

export function parseCpsWorkbook(buffer: ArrayBuffer | Buffer): {
  fileName: string | null;
  templates: CpsTemplate[];
  skippedSheets: string[];
} {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const templates: CpsTemplate[] = [];
  const skippedSheets: string[] = [];

  // Prefer known CPS sheets first, then any Step/Lead Time sheet
  const ordered = [...wb.SheetNames].sort((a, b) => {
    const ak = KNOWN_SHEETS.some((k) => k.match.test(a.trim())) ? 0 : 1;
    const bk = KNOWN_SHEETS.some((k) => k.match.test(b.trim())) ? 0 : 1;
    return ak - bk;
  });

  for (const name of ordered) {
    const sheet = wb.Sheets[name];
    if (!sheet) continue;
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
      raw: true,
    }) as unknown[][];
    const parsed = parseSheetRows(name, rows);
    if (parsed) templates.push(parsed);
    else skippedSheets.push(name);
  }

  return { fileName: null, templates, skippedSheets };
}

export function suggestBriefDate(template: CpsTemplate): string | null {
  const meta = template.metaFields;
  for (const key of Object.keys(meta)) {
    if (/brief/i.test(key) && meta[key] && /^\d{4}-\d{2}-\d{2}/.test(meta[key]!)) {
      return meta[key];
    }
  }
  // first step sample end date minus nothing — use earliest endDateSample among steps
  let earliest: string | null = null;
  for (const m of template.milestones) {
    for (const s of m.steps) {
      if (s.endDateSample) {
        if (!earliest || s.endDateSample < earliest) earliest = s.endDateSample;
      }
    }
  }
  return earliest;
}

export function suggestSosDate(template: CpsTemplate): string | null {
  const meta = template.metaFields;
  for (const key of Object.keys(meta)) {
    if (/sos/i.test(key) && meta[key] && /^\d{4}-\d{2}-\d{2}/.test(meta[key]!)) {
      return meta[key];
    }
  }
  return null;
}
