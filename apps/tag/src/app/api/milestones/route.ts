import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getDb } from "@/db";
import { milestones, projects } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/utils";

export async function GET(request: Request) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const projectId = new URL(request.url).searchParams.get("projectId");

  let rows = getDb()
    .select({
      id: milestones.id,
      projectId: milestones.projectId,
      projectName: projects.name,
      projectColor: projects.color,
      title: milestones.title,
      description: milestones.description,
      dueDate: milestones.dueDate,
      status: milestones.status,
      createdAt: milestones.createdAt,
    })
    .from(milestones)
    .leftJoin(projects, eq(milestones.projectId, projects.id))
    .all();

  if (projectId) rows = rows.filter((r) => r.projectId === projectId);
  return Response.json({ milestones: rows });
}

export async function POST(request: Request) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  const projectId = String(body?.projectId ?? "");
  if (!title || !projectId) return jsonError("Title and project required");

  const row = {
    id: uuid(),
    projectId,
    title,
    description: String(body?.description ?? ""),
    dueDate: body?.dueDate ? String(body.dueDate) : null,
    status: String(body?.status ?? "upcoming"),
    createdAt: new Date().toISOString(),
  };

  getDb().insert(milestones).values(row).run();
  return Response.json({ milestone: row });
}
