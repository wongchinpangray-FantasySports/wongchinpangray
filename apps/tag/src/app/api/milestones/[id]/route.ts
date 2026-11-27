import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { milestones } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid body");

  const existing = getDb()
    .select()
    .from(milestones)
    .where(eq(milestones.id, id))
    .get();
  if (!existing) return jsonError("Not found", 404);

  const updated = {
    title: body.title !== undefined ? String(body.title) : existing.title,
    description:
      body.description !== undefined
        ? String(body.description)
        : existing.description,
    dueDate:
      body.dueDate !== undefined
        ? body.dueDate
          ? String(body.dueDate)
          : null
        : existing.dueDate,
    status: body.status !== undefined ? String(body.status) : existing.status,
  };

  getDb().update(milestones).set(updated).where(eq(milestones.id, id)).run();
  return Response.json({ milestone: { ...existing, ...updated } });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const { id } = await ctx.params;
  getDb().delete(milestones).where(eq(milestones.id, id)).run();
  return Response.json({ ok: true });
}
