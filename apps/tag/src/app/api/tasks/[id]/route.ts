import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { dbAll, dbGet, dbRun } from "@/db/query";
import { tasks } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { syncAfterTaskChange } from "@/lib/sync-status";
import { jsonError } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid body");

  const existing = await dbGet((await getDb()).select().from(tasks).where(eq(tasks.id, id)));
  if (!existing) return jsonError("Not found", 404);

  const updated = {
    title: body.title !== undefined ? String(body.title) : existing.title,
    description:
      body.description !== undefined
        ? String(body.description)
        : existing.description,
    status: body.status !== undefined ? String(body.status) : existing.status,
    priority:
      body.priority !== undefined ? String(body.priority) : existing.priority,
    assigneeId:
      body.assigneeId !== undefined
        ? body.assigneeId
          ? String(body.assigneeId)
          : null
        : existing.assigneeId,
    milestoneId:
      body.milestoneId !== undefined
        ? body.milestoneId
          ? String(body.milestoneId)
          : null
        : existing.milestoneId,
    dueDate:
      body.dueDate !== undefined
        ? body.dueDate
          ? String(body.dueDate)
          : null
        : existing.dueDate,
    projectId:
      body.projectId !== undefined
        ? String(body.projectId)
        : existing.projectId,
    updatedAt: new Date().toISOString(),
  };

  await dbRun((await getDb()).update(tasks).set(updated).where(eq(tasks.id, id)));

  const touchedMilestones = new Set(
    [existing.milestoneId, updated.milestoneId].filter(Boolean) as string[],
  );
  for (const mid of touchedMilestones) {
    await syncAfterTaskChange(updated.projectId, mid);
  }
  if (touchedMilestones.size === 0) {
    await syncAfterTaskChange(updated.projectId, null);
  }

  return Response.json({ task: { ...existing, ...updated } });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const { id } = await ctx.params;
  const existing = await dbGet((await getDb()).select().from(tasks).where(eq(tasks.id, id)));
  await dbRun((await getDb()).delete(tasks).where(eq(tasks.id, id)));
  if (existing) {
    await syncAfterTaskChange(existing.projectId, existing.milestoneId);
  }
  return Response.json({ ok: true });
}
