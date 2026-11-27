import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("member"), // admin | member
  avatarColor: text("avatar_color").notNull().default("#1B7A4E"),
  createdAt: text("created_at").notNull(),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("active"), // active | on_hold | done | archived
  color: text("color").notNull().default("#1B7A4E"),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id),
  cpsType: text("cps_type"), // ctmz-normal | ctmz-special | posm-mockup | posm-no-mockup
  briefDate: text("brief_date"),
  startDate: text("start_date"),
  dueDate: text("due_date"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const milestones = sqliteTable("milestones", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  dueDate: text("due_date"),
  status: text("status").notNull().default("upcoming"), // upcoming | reached | missed
  createdAt: text("created_at").notNull(),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  milestoneId: text("milestone_id").references(() => milestones.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("todo"), // todo | in_progress | blocked | done
  priority: text("priority").notNull().default("medium"), // low | medium | high | urgent
  assigneeId: text("assignee_id").references(() => users.id, {
    onDelete: "set null",
  }),
  dueDate: text("due_date"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  projectId: text("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id),
  pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const assets = sqliteTable("assets", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  projectId: text("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  taskId: text("task_id").references(() => tasks.id, { onDelete: "set null" }),
  uploadedById: text("uploaded_by_id")
    .notNull()
    .references(() => users.id),
  createdAt: text("created_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});
