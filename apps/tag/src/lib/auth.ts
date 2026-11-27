import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getDb } from "@/db";
import { sessions, users } from "@/db/schema";

const SESSION_COOKIE = "tag_session";
const SESSION_DAYS = 14;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarColor: string;
};

export async function createSession(userId: string) {
  const db = getDb();
  const id = uuid();
  const createdAt = new Date().toISOString();
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DAYS);
  const expiresAt = expires.toISOString();

  db.insert(sessions).values({ id, userId, expiresAt, createdAt }).run();

  const jar = await cookies();
  jar.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires,
  });

  return id;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    getDb().delete(sessions).where(eq(sessions.id, token)).run();
    jar.delete(SESSION_COOKIE);
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  const row = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      avatarColor: users.avatarColor,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, token))
    .get();

  if (!row) return null;
  if (new Date(row.expiresAt) < new Date()) {
    db.delete(sessions).where(eq(sessions.id, token)).run();
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatarColor: row.avatarColor,
  };
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
