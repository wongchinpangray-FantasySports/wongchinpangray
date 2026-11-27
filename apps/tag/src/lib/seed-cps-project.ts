import { v4 as uuid } from "uuid";
import type { AppDb } from "@/db/types";
import { milestones, projects, tasks } from "@/db/schema";
import { dbRun } from "@/db/query";
import {
  CPS_COLORS,
  getCpsTemplate,
  scheduleFromBrief,
  type CpsTemplate,
} from "@/lib/cps";

export async function seedCpsProject(
  db: AppDb,
  opts: {
    name: string;
    description?: string;
    ownerId: string;
    cpsType?: string;
    template?: CpsTemplate;
    briefDate: string;
    color?: string;
    projectId?: string;
  },
) {
  const template =
    opts.template ?? (opts.cpsType ? getCpsTemplate(opts.cpsType) : null);
  if (!template) throw new Error("CPS template required");

  const cpsType = opts.cpsType ?? template.id;
  const stamp = new Date().toISOString();
  const projectId = opts.projectId ?? uuid();

  let lastDue: string | null = opts.briefDate;
  for (const m of template.milestones) {
    for (const s of m.steps) {
      lastDue = scheduleFromBrief(opts.briefDate, s.offsetDaysFromBrief);
    }
  }

  await dbRun(db.insert(projects)
    .values({
      id: projectId,
      name: opts.name,
      description:
        opts.description ??
        `CPS ${template.name} — seeded from workbook sheet "${template.sheetName.trim()}".`,
      status: "active",
      color: opts.color ?? CPS_COLORS[cpsType] ?? "#1B7A4E",
      ownerId: opts.ownerId,
      cpsType,
      briefDate: opts.briefDate,
      startDate: opts.briefDate,
      dueDate: lastDue,
      createdAt: stamp,
      updatedAt: stamp,
    })
    );

  for (const m of template.milestones) {
    const msId = uuid();
    const msDue = m.steps.length
      ? scheduleFromBrief(
          opts.briefDate,
          m.steps[m.steps.length - 1].offsetDaysFromBrief,
        )
      : opts.briefDate;

    await dbRun(db.insert(milestones)
      .values({
        id: msId,
        projectId,
        title: m.title,
        description: m.weekLabel
          ? `CPS week marker ${m.weekLabel} from ${template.sheetName.trim()}`
          : `CPS phase from ${template.sheetName.trim()}`,
        dueDate: msDue,
        status: "upcoming",
        createdAt: stamp,
      })
      );

    for (const s of m.steps) {
      const due = scheduleFromBrief(opts.briefDate, s.offsetDaysFromBrief);
      const bits = [
        s.ownerRole ? `Owner role: ${s.ownerRole}` : null,
        s.leadTimeDays ? `Lead time: ${s.leadTimeDays} WD` : null,
        s.notes || null,
      ].filter(Boolean);

      await dbRun(db.insert(tasks)
        .values({
          id: uuid(),
          projectId,
          milestoneId: msId,
          title: s.title,
          description: bits.join(" · "),
          status: "todo",
          priority: s.title.toLowerCase().includes("sos")
            ? "urgent"
            : s.leadTimeDays >= 10
              ? "high"
              : "medium",
          assigneeId: null,
          dueDate: due,
          createdAt: stamp,
          updatedAt: stamp,
        })
        );
    }
  }

  return { projectId, template };
}
