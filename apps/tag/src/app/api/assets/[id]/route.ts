import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm";
import { getDb, getUploadsDir } from "@/db";
import { assets } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid body");

  const existing = getDb().select().from(assets).where(eq(assets.id, id)).get();
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

  getDb().update(assets).set(updated).where(eq(assets.id, id)).run();
  return Response.json({ asset: { ...existing, ...updated } });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const { id } = await ctx.params;

  const existing = getDb().select().from(assets).where(eq(assets.id, id)).get();
  if (!existing) return jsonError("Not found", 404);

  const filePath = path.join(getUploadsDir(), existing.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  getDb().delete(assets).where(eq(assets.id, id)).run();
  return Response.json({ ok: true });
}
