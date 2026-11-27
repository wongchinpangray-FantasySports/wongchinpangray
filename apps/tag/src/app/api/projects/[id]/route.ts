import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { milestones, projects, tasks, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import {
  currentMilestone,
  derivedMilestoneStatus,
  milestoneProgress,
  projectProgress,
} from "@/lib/progress";
import { jsonError } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const { id } = await ctx.params;

  const project = getDb()
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      color: projects.color,
      ownerId: projects.ownerId,
      ownerName: users.name,
      startDate: projects.startDate,
      dueDate: projects.dueDate,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .leftJoin(users, eq(projects.ownerId, users.id))
    .where(eq(projects.id, id))
    .get();

  if (!project) return jsonError("Not found", 404);

  const projectTasks = getDb()
    .select({
      id: tasks.id,
      projectId: tasks.projectId,
      milestoneId: tasks.milestoneId,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      assigneeId: tasks.assigneeId,
      assigneeName: users.name,
      assigneeColor: users.avatarColor,
      dueDate: tasks.dueDate,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.assigneeId, users.id))
    .where(eq(tasks.projectId, id))
    .all();

  const projectMilestones = getDb()
    .select()
    .from(milestones)
    .where(eq(milestones.projectId, id))
    .all()
    .map((m) => {
      const progress = milestoneProgress(m.id, projectTasks);
      const liveStatus = derivedMilestoneStatus(m, projectTasks);
      return {
        ...m,
        progress: {
          done: progress.done,
          total: progress.total,
          percent: progress.percent,
          complete: progress.complete,
        },
        liveStatus,
      };
    })
    .sort((a, b) => {
      const ad = a.dueDate || "9999-12-31";
      const bd = b.dueDate || "9999-12-31";
      return ad.localeCompare(bd);
    });

  const progress = projectProgress(projectTasks);
  const current = currentMilestone(
    projectMilestones.map(({ progress: _p, liveStatus: _l, ...m }) => m),
    projectTasks,
  );

  return Response.json({
    project,
    tasks: projectTasks,
    milestones: projectMilestones,
    progress,
    currentMilestone: current
      ? {
          id: current.id,
          title: current.title,
          dueDate: current.dueDate,
          overdue: current.overdue,
          progress: {
            done: current.progress.done,
            total: current.progress.total,
            percent: current.progress.percent,
            complete: current.progress.complete,
          },
        }
      : null,
  });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid body");

  const existing = getDb().select().from(projects).where(eq(projects.id, id)).get();
  if (!existing) return jsonError("Not found", 404);

  const updated = {
    name: body.name !== undefined ? String(body.name) : existing.name,
    description:
      body.description !== undefined
        ? String(body.description)
        : existing.description,
    status: body.status !== undefined ? String(body.status) : existing.status,
    color: body.color !== undefined ? String(body.color) : existing.color,
    ownerId:
      body.ownerId !== undefined ? String(body.ownerId) : existing.ownerId,
    startDate:
      body.startDate !== undefined
        ? body.startDate
          ? String(body.startDate)
          : null
        : existing.startDate,
    dueDate:
      body.dueDate !== undefined
        ? body.dueDate
          ? String(body.dueDate)
          : null
        : existing.dueDate,
    updatedAt: new Date().toISOString(),
  };

  getDb().update(projects).set(updated).where(eq(projects.id, id)).run();
  return Response.json({ project: { ...existing, ...updated } });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const { id } = await ctx.params;
  getDb().delete(projects).where(eq(projects.id, id)).run();
  return Response.json({ ok: true });
}
