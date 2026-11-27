import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { dbGet, dbRun } from "@/db/query";
import { assets } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { deleteUploadObject } from "@/lib/storage";
import { jsonError } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid body");

  const db = await getDb();
  const existing = await dbGet(
    db.select().from(assets).where(eq(assets.id, id)),
  );
  if (!existing) return jsonError("Not found", 404);

  const updated = {
    projectId:
      body.projectId !== undefined
        ? body.projectId
          ? String(body.projectId)
          : null
        : existing.projectId,
    taskId:
      body.taskId !== undefined
        ? body.taskId
          ? String(body.taskId)
          : null
        : existing.taskId,
  };

  await dbRun(db.update(assets).set(updated).where(eq(assets.id, id)));
  return Response.json({ asset: { ...existing, ...updated } });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const { id } = await ctx.params;

  const db = await getDb();
  const existing = await dbGet(
    db.select().from(assets).where(eq(assets.id, id)),
  );
  if (!existing) return jsonError("Not found", 404);

  await deleteUploadObject(existing.filename);
  await dbRun(db.delete(assets).where(eq(assets.id, id)));
  return Response.json({ ok: true });
}
