import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/auth";
import { jsonError } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!email || !password) return jsonError("Email and password required");

  const user = getDb().select().from(users).where(eq(users.email, email)).get();
  if (!user || user.password !== password) {
    return jsonError("Invalid credentials", 401);
  }

  await createSession(user.id);
  return Response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarColor: user.avatarColor,
    },
  });
}
