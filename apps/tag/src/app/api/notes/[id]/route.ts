import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { dbAll, dbGet, dbRun } from "@/db/query";
import { notes } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid body");

  const existing = await dbGet((await getDb()).select().from(notes).where(eq(notes.id, id)));
  if (!existing) return jsonError("Not found", 404);

  const updated = {
    title: body.title !== undefined ? String(body.title) : existing.title,
    body: body.body !== undefined ? String(body.body) : existing.body,
    projectId:
      body.projectId !== undefined
        ? body.projectId
          ? String(body.projectId)
          : null
        : existing.projectId,
    pinned: body.pinned !== undefined ? Boolean(body.pinned) : existing.pinned,
    updatedAt: new Date().toISOString(),
  };

  await dbRun((await getDb()).update(notes).set(updated).where(eq(notes.id, id)));
  return Response.json({ note: { ...existing, ...updated } });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const { id } = await ctx.params;
  await dbRun((await getDb()).delete(notes).where(eq(notes.id, id)));
  return Response.json({ ok: true });
}
