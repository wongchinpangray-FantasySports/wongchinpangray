import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import fs from "fs";
import path from "path";
import * as schema from "./schema";
import { TAG_SCHEMA_SQL } from "./sql";
import type { AppDb } from "./types";
import { ensureCpsDemoProjects } from "./ensure-cps-demos";
import { seedIfEmpty } from "./seed";
import { getCloudflareEnv } from "@/lib/cf";

export type { AppDb } from "./types";
const dataDir = path.join(process.cwd(), "data");
const uploadsDir = path.join(dataDir, "uploads");
const dbPath = path.join(dataDir, "tag.db");

const globalForDb = globalThis as unknown as {
  __tagDb?: AppDb;
  __tagDbReady?: Promise<AppDb>;
  __tagBackend?: "local" | "d1";
};

function ensureDirs() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
}

async function migrateD1(d1: D1Database) {
  // Apply statements one-by-one — safer across D1 / miniflare
  const statements = TAG_SCHEMA_SQL.split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const sql of statements) {
    await d1.prepare(sql).run();
  }
}

async function createLocalDb(): Promise<AppDb> {
  const Database = (await import("better-sqlite3")).default;
  const { drizzle } = await import("drizzle-orm/better-sqlite3");
  ensureDirs();
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(TAG_SCHEMA_SQL);

  // Legacy column adds for older local DBs created before cps fields existed
  const cols = sqlite.prepare(`PRAGMA table_info(projects)`).all() as Array<{
    name: string;
  }>;
  const names = new Set(cols.map((c) => c.name));
  if (!names.has("cps_type")) sqlite.exec(`ALTER TABLE projects ADD COLUMN cps_type TEXT`);
  if (!names.has("brief_date")) {
    sqlite.exec(`ALTER TABLE projects ADD COLUMN brief_date TEXT`);
  }

  const db = drizzle(sqlite, { schema });
  await seedIfEmpty(db);
  await ensureCpsDemoProjects(db);
  return db;
}

async function createD1Db(d1: D1Database): Promise<AppDb> {
  await migrateD1(d1);
  const db = drizzleD1(d1, { schema });
  await seedIfEmpty(db);
  await ensureCpsDemoProjects(db);
  return db;
}

async function resolveDb(): Promise<AppDb> {
  const env = await getCloudflareEnv();
  if (env?.TAG_DB) {
    globalForDb.__tagBackend = "d1";
    return createD1Db(env.TAG_DB);
  }
  globalForDb.__tagBackend = "local";
  return createLocalDb();
}

/** Async DB accessor — local better-sqlite3 or Cloudflare D1. */
export async function getDb(): Promise<AppDb> {
  if (globalForDb.__tagDb) return globalForDb.__tagDb;
  if (!globalForDb.__tagDbReady) {
    globalForDb.__tagDbReady = resolveDb().then((db) => {
      globalForDb.__tagDb = db;
      return db;
    });
  }
  return globalForDb.__tagDbReady;
}

/** @deprecated Prefer `@/lib/storage` — kept for local-only helpers. */
export function getUploadsDir() {
  ensureDirs();
  return uploadsDir;
}

export function getDbBackend() {
  return globalForDb.__tagBackend ?? "local";
}

export type Db = AppDb;
