import { desc, eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getDb } from "@/db";
import { dbAll, dbRun } from "@/db/query";
import { milestones, projects, tasks, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getCpsTemplate } from "@/lib/cps";
import { currentMilestone, projectProgress } from "@/lib/progress";
import { seedCpsProject } from "@/lib/seed-cps-project";
import { jsonError } from "@/lib/utils";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const db = await getDb();
  const rows = await dbAll(
    db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        color: projects.color,
        ownerId: projects.ownerId,
        ownerName: users.name,
        cpsType: projects.cpsType,
        briefDate: projects.briefDate,
        startDate: projects.startDate,
        dueDate: projects.dueDate,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .leftJoin(users, eq(projects.ownerId, users.id))
      .orderBy(desc(projects.updatedAt)),
  );

  const allTasks = await dbAll(db.select().from(tasks));
  const allMilestones = await dbAll(db.select().from(milestones));

  const enriched = rows.map((p) => {
    const projectTasks = allTasks.filter((t) => t.projectId === p.id);
    const projectMs = allMilestones.filter((m) => m.projectId === p.id);
    const progress = projectProgress(projectTasks);
    const current = currentMilestone(projectMs, projectTasks);
    const template = p.cpsType ? getCpsTemplate(p.cpsType) : null;
    return {
      ...p,
      cpsName: template?.name ?? null,
      progress,
      currentMilestone: current
        ? {
            id: current.id,
            title: current.title,
            percent: current.progress.percent,
            overdue: current.overdue,
          }
        : null,
    };
  });

  return Response.json({ projects: enriched });
}

export async function POST(request: Request) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  if (!name) return jsonError("Name required");

  const cpsType = body?.cpsType ? String(body.cpsType) : null;
  const uploadedTemplate = body?.cpsTemplate ?? null;
  const briefDate = body?.briefDate
    ? String(body.briefDate)
    : new Date().toISOString().slice(0, 10);

  if (cpsType || uploadedTemplate) {
    if (cpsType && !uploadedTemplate && !getCpsTemplate(cpsType)) {
      return jsonError("Unknown CPS type");
    }
    const db = await getDb();
    try {
      const { projectId, template } = await seedCpsProject(db, {
        name,
        description: String(body?.description ?? ""),
        ownerId: String(body?.ownerId ?? me.id),
        cpsType: cpsType || undefined,
        template: uploadedTemplate || undefined,
        briefDate,
        color: body?.color ? String(body.color) : undefined,
      });
      return Response.json({
        project: {
          id: projectId,
          name,
          cpsType: template.id,
          briefDate,
          cpsName: template.name,
        },
      });
    } catch (err) {
      return jsonError(
        err instanceof Error ? err.message : "Failed to seed CPS project",
        400,
      );
    }
  }

  const id = uuid();
  const stamp = new Date().toISOString();
  const row = {
    id,
    name,
    description: String(body?.description ?? ""),
    status: String(body?.status ?? "active"),
    color: String(body?.color ?? "#1B7A4E"),
    ownerId: String(body?.ownerId ?? me.id),
    cpsType: null,
    briefDate: null,
    startDate: body?.startDate ? String(body.startDate) : null,
    dueDate: body?.dueDate ? String(body.dueDate) : null,
    createdAt: stamp,
    updatedAt: stamp,
  };

  await dbRun((await getDb()).insert(projects).values(row));
  return Response.json({
    project: {
      ...row,
      progress: { done: 0, total: 0, percent: 0, complete: false },
      currentMilestone: null,
    },
  });
}
