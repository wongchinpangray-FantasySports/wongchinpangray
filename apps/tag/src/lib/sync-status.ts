import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { milestones, projects, tasks } from "@/db/schema";
import {
  derivedMilestoneStatus,
  projectProgress,
} from "@/lib/progress";

/** After a task changes, refresh milestone live status and project rollup status. */
export function syncAfterTaskChange(projectId: string, milestoneId: string | null) {
  const db = getDb();
  const projectTasks = db
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, projectId))
    .all();

  if (milestoneId) {
    const ms = db
      .select()
      .from(milestones)
      .where(eq(milestones.id, milestoneId))
      .get();
    if (ms) {
      const live = derivedMilestoneStatus(ms, projectTasks);
      if (live !== ms.status) {
        db.update(milestones)
          .set({ status: live })
          .where(eq(milestones.id, milestoneId))
          .run();
      }
    }
  }

  const project = db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .get();
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
    db.update(projects)
      .set({ status: nextStatus, updatedAt: new Date().toISOString() })
      .where(eq(projects.id, projectId))
      .run();
  }
}
