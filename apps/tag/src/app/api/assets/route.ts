import path from "path";
import { desc, eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getDb } from "@/db";
import { dbAll, dbRun } from "@/db/query";
import { assets, projects, tasks, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { putUploadObject } from "@/lib/storage";
import { jsonError } from "@/lib/utils";

export async function GET(request: Request) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const taskId = searchParams.get("taskId");

  const db = await getDb();
  let rows = await dbAll(
    db
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
      .orderBy(desc(assets.createdAt)),
  );

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
  const mimeType = file.type || "application/octet-stream";
  await putUploadObject(filename, buffer, mimeType);

  const row = {
    id: uuid(),
    filename,
    originalName: file.name,
    mimeType,
    size: buffer.length,
    projectId,
    taskId,
    uploadedById: me.id,
    createdAt: new Date().toISOString(),
  };

  await dbRun((await getDb()).insert(assets).values(row));
  return Response.json({ asset: row });
}
