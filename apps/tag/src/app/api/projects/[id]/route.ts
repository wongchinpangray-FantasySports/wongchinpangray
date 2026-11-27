import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { milestones, projects, tasks, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
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
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, id))
    .all();
  const projectMilestones = getDb()
    .select()
    .from(milestones)
    .where(eq(milestones.projectId, id))
    .all();

  return Response.json({
    project,
    tasks: projectTasks,
    milestones: projectMilestones,
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
