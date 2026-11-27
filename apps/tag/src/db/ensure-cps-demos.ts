import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { listCpsTemplates } from "@/lib/cps";
import { seedCpsProject } from "@/lib/seed-cps-project";

const DEMOS = [
  {
    id: "cps-ctmz-normal",
    cpsType: "ctmz-normal",
    name: "CPS Demo — CTMZ (Normal)",
    briefDate: "2026-11-12",
  },
  {
    id: "cps-ctmz-special",
    cpsType: "ctmz-special",
    name: "CPS Demo — CTMZ (Special)",
    briefDate: "2026-09-30",
  },
  {
    id: "cps-posm-mockup",
    cpsType: "posm-mockup",
    name: "CPS Demo — POSM (Mock up needed)",
    briefDate: "2026-03-06",
  },
  {
    id: "cps-posm-no-mockup",
    cpsType: "posm-no-mockup",
    name: "CPS Demo — POSM (No Mock up)",
    briefDate: "2026-04-03",
  },
];

/** Idempotent: seeds one demo project per CPS type if missing. */
export function ensureCpsDemoProjects(
  db: BetterSQLite3Database<typeof schema>,
) {
  // Templates must load; no-op if JSON missing
  if (listCpsTemplates().length === 0) return;

  const owner =
    db.select().from(schema.users).where(eq(schema.users.id, "user-alex")).get() ??
    db.select().from(schema.users).all()[0];
  if (!owner) return;

  for (const demo of DEMOS) {
    const existing = db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, demo.id))
      .get();
    if (existing) continue;

    seedCpsProject(db, {
      projectId: demo.id,
      name: demo.name,
      ownerId: owner.id,
      cpsType: demo.cpsType,
      briefDate: demo.briefDate,
      description: `Demo seeded from CPS workbook template ${demo.cpsType}.`,
    });
  }
}
