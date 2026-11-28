import { and, eq, gte, lte } from "drizzle-orm";
import { getDb } from "@/db";
import { dbAll } from "@/db/query";
import { milestones, notes, projects, tasks, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/utils";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const db = await getDb();
  const today = new Date().toISOString().slice(0, 10);
  const weekOut = new Date();
  weekOut.setDate(weekOut.getDate() + 7);
  const weekStr = weekOut.toISOString().slice(0, 10);

  const allProjects = await dbAll(db.select().from(projects));
  const allTasks = await dbAll(
    db
      .select({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        projectId: tasks.projectId,
        projectName: projects.name,
        projectColor: projects.color,
        assigneeId: tasks.assigneeId,
        assigneeName: users.name,
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(users, eq(tasks.assigneeId, users.id)),
  );

  const dueSoon = allTasks.filter(
    (t) =>
      t.dueDate &&
      t.dueDate >= today &&
      t.dueDate <= weekStr &&
      t.status !== "done",
  );
  const overdue = allTasks.filter(
    (t) => t.dueDate && t.dueDate < today && t.status !== "done",
  );
  const mine = allTasks.filter(
    (t) => t.assigneeId === me.id && t.status !== "done",
  );
  const blocked = allTasks.filter((t) => t.status === "blocked");

  const upcomingMilestones = await dbAll(
    db
      .select({
        id: milestones.id,
        title: milestones.title,
        dueDate: milestones.dueDate,
        status: milestones.status,
        projectName: projects.name,
        projectColor: projects.color,
      })
      .from(milestones)
      .leftJoin(projects, eq(milestones.projectId, projects.id))
      .where(
        and(
          eq(milestones.status, "upcoming"),
          gte(milestones.dueDate, today),
          lte(milestones.dueDate, weekStr),
        ),
      ),
  );

  const pinnedNotes = await dbAll(
    db
      .select({
        id: notes.id,
        title: notes.title,
        body: notes.body,
        projectName: projects.name,
      })
      .from(notes)
      .leftJoin(projects, eq(notes.projectId, projects.id))
      .where(eq(notes.pinned, true)),
  );

  const teamUsers = await dbAll(
    db
      .select({
        id: users.id,
        name: users.name,
        avatarColor: users.avatarColor,
        role: users.role,
      })
      .from(users),
  );

  const team = teamUsers.map((u) => ({
    ...u,
    openTasks: allTasks.filter(
      (t) => t.assigneeId === u.id && t.status !== "done",
    ).length,
  }));

  return Response.json({
    stats: {
      activeProjects: allProjects.filter((p) => p.status === "active").length,
      openTasks: allTasks.filter((t) => t.status !== "done").length,
      overdue: overdue.length,
      blocked: blocked.length,
    },
    dueSoon,
    overdue,
    mine,
    upcomingMilestones,
    pinnedNotes,
    team,
  });
}
