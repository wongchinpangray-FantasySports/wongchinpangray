import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { dbAll, dbGet, dbRun } from "@/db/query";
import { milestones, projects, tasks } from "@/db/schema";
import {
  derivedMilestoneStatus,
  projectProgress,
} from "@/lib/progress";

/** After a task changes, refresh milestone live status and project rollup status. */
export async function syncAfterTaskChange(
  projectId: string,
  milestoneId: string | null,
) {
  const db = await getDb();
  const projectTasks = await dbAll(
    db.select().from(tasks).where(eq(tasks.projectId, projectId)),
  );

  if (milestoneId) {
    const ms = await dbGet(
      db.select().from(milestones).where(eq(milestones.id, milestoneId)),
    );
    if (ms) {
      const live = derivedMilestoneStatus(ms, projectTasks);
      if (live !== ms.status) {
        await dbRun(
          db
            .update(milestones)
            .set({ status: live })
            .where(eq(milestones.id, milestoneId)),
        );
      }
    }
  }

  const project = await dbGet(
    db.select().from(projects).where(eq(projects.id, projectId)),
  );
  if (!project) return;

  // Don't override archived / on_hold manually held states
  if (project.status === "archived" || project.status === "on_hold") return;

  const progress = projectProgress(projectTasks);
  const nextStatus = progress.complete
    ? "done"
    : progress.total > 0
      ? "active"
      : project.status;

  if (nextStatus !== project.status) {
    await dbRun(
      db
        .update(projects)
        .set({ status: nextStatus, updatedAt: new Date().toISOString() })
        .where(eq(projects.id, projectId)),
    );
  }
}
