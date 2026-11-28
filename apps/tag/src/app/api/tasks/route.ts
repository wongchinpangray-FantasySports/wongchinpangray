import { desc, eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getDb } from "@/db";
import { dbAll, dbGet, dbRun } from "@/db/query";
import { projects, tasks, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { syncAfterTaskChange } from "@/lib/sync-status";
import { jsonError } from "@/lib/utils";

export async function GET(request: Request) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const assigneeId = searchParams.get("assigneeId");

  let rows = await dbAll(
    (await getDb())
      .select({
        id: tasks.id,
        projectId: tasks.projectId,
        projectName: projects.name,
        projectColor: projects.color,
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
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .orderBy(desc(tasks.updatedAt)),
  );

  if (projectId) rows = rows.filter((r) => r.projectId === projectId);
  if (assigneeId) rows = rows.filter((r) => r.assigneeId === assigneeId);

  return Response.json({ tasks: rows });
}

export async function POST(request: Request) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  const projectId = String(body?.projectId ?? "");
  if (!title || !projectId) return jsonError("Title and project required");

  const stamp = new Date().toISOString();
  const row = {
    id: uuid(),
    projectId,
    milestoneId: body?.milestoneId ? String(body.milestoneId) : null,
    title,
    description: String(body?.description ?? ""),
    status: String(body?.status ?? "todo"),
    priority: String(body?.priority ?? "medium"),
    assigneeId: body?.assigneeId ? String(body.assigneeId) : null,
    dueDate: body?.dueDate ? String(body.dueDate) : null,
    createdAt: stamp,
    updatedAt: stamp,
  };

  await dbRun((await getDb()).insert(tasks).values(row));
  await syncAfterTaskChange(row.projectId, row.milestoneId);
  return Response.json({ task: row });
}
