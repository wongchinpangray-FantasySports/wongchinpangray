import { desc, eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getDb } from "@/db";
import { projects, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/utils";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const rows = getDb()
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
    .orderBy(desc(projects.updatedAt))
    .all();

  return Response.json({ projects: rows });
}

export async function POST(request: Request) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  if (!name) return jsonError("Name required");

  const id = uuid();
  const stamp = new Date().toISOString();
  const row = {
    id,
    name,
    description: String(body?.description ?? ""),
    status: String(body?.status ?? "active"),
    color: String(body?.color ?? "#1B7A4E"),
    ownerId: String(body?.ownerId ?? me.id),
    startDate: body?.startDate ? String(body.startDate) : null,
    dueDate: body?.dueDate ? String(body.dueDate) : null,
    createdAt: stamp,
    updatedAt: stamp,
  };

  getDb().insert(projects).values(row).run();
  return Response.json({ project: row });
}
