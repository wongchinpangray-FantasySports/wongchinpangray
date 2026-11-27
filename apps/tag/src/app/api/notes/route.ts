import { desc, eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getDb } from "@/db";
import { dbAll, dbGet, dbRun } from "@/db/query";
import { notes, projects, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/utils";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const rows = await dbAll(
    (await getDb())
      .select({
        id: notes.id,
        title: notes.title,
        body: notes.body,
        projectId: notes.projectId,
        projectName: projects.name,
        authorId: notes.authorId,
        authorName: users.name,
        pinned: notes.pinned,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
      })
      .from(notes)
      .leftJoin(projects, eq(notes.projectId, projects.id))
      .leftJoin(users, eq(notes.authorId, users.id))
      .orderBy(desc(notes.pinned), desc(notes.updatedAt)),
  );

  return Response.json({ notes: rows });
}

export async function POST(request: Request) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  if (!title) return jsonError("Title required");

  const stamp = new Date().toISOString();
  const row = {
    id: uuid(),
    title,
    body: String(body?.body ?? ""),
    projectId: body?.projectId ? String(body.projectId) : null,
    authorId: me.id,
    pinned: Boolean(body?.pinned),
    createdAt: stamp,
    updatedAt: stamp,
  };

  await dbRun((await getDb()).insert(notes).values(row));
  return Response.json({ note: row });
}
