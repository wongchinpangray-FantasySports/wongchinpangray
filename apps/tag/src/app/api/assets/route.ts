import fs from "fs";
import path from "path";
import { desc, eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getDb, getUploadsDir } from "@/db";
import { assets, projects, tasks, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/utils";

export async function GET(request: Request) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const taskId = searchParams.get("taskId");

  let rows = getDb()
    .select({
      id: assets.id,
      filename: assets.filename,
      originalName: assets.originalName,
      mimeType: assets.mimeType,
      size: assets.size,
      projectId: assets.projectId,
      projectName: projects.name,
      taskId: assets.taskId,
      taskTitle: tasks.title,
      uploadedById: assets.uploadedById,
      uploadedByName: users.name,
      createdAt: assets.createdAt,
    })
    .from(assets)
    .leftJoin(projects, eq(assets.projectId, projects.id))
    .leftJoin(tasks, eq(assets.taskId, tasks.id))
    .leftJoin(users, eq(assets.uploadedById, users.id))
    .orderBy(desc(assets.createdAt))
    .all();

  if (projectId) rows = rows.filter((r) => r.projectId === projectId);
  if (taskId) rows = rows.filter((r) => r.taskId === taskId);

  return Response.json({ assets: rows });
}

export async function POST(request: Request) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("File required");

  const projectId = form.get("projectId")
    ? String(form.get("projectId"))
    : null;
  const taskId = form.get("taskId") ? String(form.get("taskId")) : null;

  const ext = path.extname(file.name) || "";
  const filename = `${uuid()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const dest = path.join(getUploadsDir(), filename);
  fs.writeFileSync(dest, buffer);

  const row = {
    id: uuid(),
    filename,
    originalName: file.name,
    mimeType: file.type || "application/octet-stream",
    size: buffer.length,
    projectId,
    taskId,
    uploadedById: me.id,
    createdAt: new Date().toISOString(),
  };

  getDb().insert(assets).values(row).run();
  return Response.json({ asset: row });
}
