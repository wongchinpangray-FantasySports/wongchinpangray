import { count } from "drizzle-orm";
import type { AppDb } from "./types";
import * as schema from "./schema";
import { dbAll, dbRun } from "./query";

const now = () => new Date().toISOString();
const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export async function seedIfEmpty(db: AppDb) {
  const [{ value }] = await dbAll(db.select({ value: count() }).from(schema.users));
  if (value > 0) return;

  const createdAt = now();

  const alex = {
    id: "user-alex",
    name: "Ray",
    email: "alex@tag.local",
    password: "tagdemo",
    role: "admin",
    avatarColor: "#1B7A4E",
    createdAt,
  };
  const jordan = {
    id: "user-jordan",
    name: "Jordan Lee",
    email: "jordan@tag.local",
    password: "tagdemo",
    role: "member",
    avatarColor: "#0C4A6E",
    createdAt,
  };
  const sam = {
    id: "user-sam",
    name: "Sam Rivera",
    email: "sam@tag.local",
    password: "tagdemo",
    role: "member",
    avatarColor: "#B45309",
    createdAt,
  };

  await dbRun(db.insert(schema.users).values([alex, jordan, sam]));

  await dbRun(db.insert(schema.projects)
    .values([
      {
        id: "proj-atlas",
        name: "Atlas Launch",
        description: "Ship the day-one ops platform for the studio team.",
        status: "active",
        color: "#1B7A4E",
        ownerId: alex.id,
        startDate: daysFromNow(-14),
        dueDate: daysFromNow(21),
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "proj-field",
        name: "Field Kit Refresh",
        description: "Update shoot kits, checklists, and asset packing lists.",
        status: "active",
        color: "#0C4A6E",
        ownerId: jordan.id,
        startDate: daysFromNow(-7),
        dueDate: daysFromNow(10),
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "proj-archive",
        name: "Archive Digitization",
        description: "Catalog and restore legacy media into the DAM.",
        status: "on_hold",
        color: "#B45309",
        ownerId: sam.id,
        startDate: daysFromNow(-30),
        dueDate: daysFromNow(45),
        createdAt,
        updatedAt: createdAt,
      },
    ])
    );

  await dbRun(db.insert(schema.milestones)
    .values([
      {
        id: "ms-alpha",
        projectId: "proj-atlas",
        title: "Alpha walkthrough",
        description: "Internal demo of dashboard + calendar.",
        dueDate: daysFromNow(3),
        status: "upcoming",
        createdAt,
      },
      {
        id: "ms-beta",
        projectId: "proj-atlas",
        title: "Beta freeze",
        description: "Feature freeze before launch week.",
        dueDate: daysFromNow(14),
        status: "upcoming",
        createdAt,
      },
      {
        id: "ms-kits",
        projectId: "proj-field",
        title: "Kit checklist signed",
        description: "All field leads sign off on packing lists.",
        dueDate: daysFromNow(7),
        status: "upcoming",
        createdAt,
      },
    ])
    );

  await dbRun(db.insert(schema.tasks)
    .values([
      {
        id: "task-1",
        projectId: "proj-atlas",
        milestoneId: "ms-alpha",
        title: "Wire dashboard metrics",
        description: "Active projects, due soon, blocked tasks.",
        status: "done",
        priority: "high",
        assigneeId: alex.id,
        dueDate: daysFromNow(-1),
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "task-2",
        projectId: "proj-atlas",
        milestoneId: "ms-alpha",
        title: "Calendar month view",
        description: "Show tasks and milestones on the calendar.",
        status: "in_progress",
        priority: "high",
        assigneeId: jordan.id,
        dueDate: daysFromNow(2),
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "task-3",
        projectId: "proj-atlas",
        milestoneId: "ms-alpha",
        title: "Rehearse walkthrough script",
        description: "Five-minute demo path for stakeholders.",
        status: "todo",
        priority: "medium",
        assigneeId: alex.id,
        dueDate: daysFromNow(3),
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "task-3b",
        projectId: "proj-atlas",
        milestoneId: "ms-beta",
        title: "DAM attach flow",
        description: "Upload files and link to projects/tasks.",
        status: "todo",
        priority: "urgent",
        assigneeId: sam.id,
        dueDate: daysFromNow(5),
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "task-3c",
        projectId: "proj-atlas",
        milestoneId: "ms-beta",
        title: "Freeze feature list",
        description: "Lock scope for launch week.",
        status: "todo",
        priority: "high",
        assigneeId: jordan.id,
        dueDate: daysFromNow(12),
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "task-3d",
        projectId: "proj-atlas",
        milestoneId: "ms-beta",
        title: "Regression pass",
        description: "Smoke critical paths after freeze.",
        status: "todo",
        priority: "high",
        assigneeId: alex.id,
        dueDate: daysFromNow(14),
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "task-4",
        projectId: "proj-field",
        milestoneId: "ms-kits",
        title: "Audit current kits",
        description: "Walk each kit and note missing items.",
        status: "in_progress",
        priority: "medium",
        assigneeId: jordan.id,
        dueDate: daysFromNow(1),
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "task-5",
        projectId: "proj-field",
        milestoneId: "ms-kits",
        title: "Order replacement batteries",
        description: "Two packs per camera body.",
        status: "blocked",
        priority: "high",
        assigneeId: sam.id,
        dueDate: daysFromNow(4),
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "task-5b",
        projectId: "proj-field",
        milestoneId: "ms-kits",
        title: "Collect lead signatures",
        description: "Get packing-list sign-off from each field lead.",
        status: "todo",
        priority: "medium",
        assigneeId: jordan.id,
        dueDate: daysFromNow(7),
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "task-6",
        projectId: "proj-archive",
        milestoneId: null,
        title: "Define naming convention",
        description: "Project-year-sequence for restored files.",
        status: "todo",
        priority: "low",
        assigneeId: alex.id,
        dueDate: daysFromNow(12),
        createdAt,
        updatedAt: createdAt,
      },
    ])
    );

  await dbRun(db.insert(schema.notes)
    .values([
      {
        id: "note-1",
        title: "Standup cadence",
        body: "Daily 09:30 huddle. Keep updates to blockers and due-date shifts only.",
        projectId: "proj-atlas",
        authorId: alex.id,
        pinned: true,
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "note-2",
        title: "Vendor lead times",
        body: "Battery packs: 5–7 business days. Soft cases: 2 weeks. Order early for Field Kit Refresh.",
        projectId: "proj-field",
        authorId: jordan.id,
        pinned: false,
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "note-3",
        title: "DAM ingest rules",
        body: "Attach finals to the project. Working drafts go on the related task. Prefer descriptive filenames.",
        projectId: null,
        authorId: sam.id,
        pinned: true,
        createdAt,
        updatedAt: createdAt,
      },
    ])
    );
}
