import { getDb } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/utils";
import { v4 as uuid } from "uuid";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const list = getDb()
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      avatarColor: users.avatarColor,
      createdAt: users.createdAt,
    })
    .from(users)
    .all();

  return Response.json({ users: list });
}

export async function POST(request: Request) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  if (me.role !== "admin") return jsonError("Admin only", 403);

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "tagdemo");
  const role = body?.role === "admin" ? "admin" : "member";
  const avatarColor = String(body?.avatarColor ?? "#1B7A4E");

  if (!name || !email) return jsonError("Name and email required");

  const id = uuid();
  const createdAt = new Date().toISOString();

  try {
    getDb()
      .insert(users)
      .values({ id, name, email, password, role, avatarColor, createdAt })
      .run();
  } catch {
    return jsonError("Email already in use", 409);
  }

  return Response.json({
    user: { id, name, email, role, avatarColor, createdAt },
  });
}
