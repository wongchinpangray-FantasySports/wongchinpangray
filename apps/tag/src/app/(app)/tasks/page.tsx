"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { StatusPill } from "@/components/StatusPill";
import { Avatar } from "@/components/Avatar";
import { api } from "@/lib/api-client";

type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  projectId: string;
  projectName: string | null;
  projectColor: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeColor: string | null;
};

type Project = { id: string; name: string };
type User = { id: string; name: string; avatarColor: string };

const COLUMNS = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "blocked", label: "Blocked" },
  { key: "done", label: "Done" },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState({ projectId: "", assigneeId: "" });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    projectId: "",
    status: "todo",
    priority: "medium",
    assigneeId: "",
    dueDate: "",
  });

  async function load() {
    const qs = new URLSearchParams();
    if (filter.projectId) qs.set("projectId", filter.projectId);
    if (filter.assigneeId) qs.set("assigneeId", filter.assigneeId);
    const [t, p, u] = await Promise.all([
      api<{ tasks: Task[] }>(`/api/tasks?${qs}`),
      api<{ projects: Project[] }>("/api/projects"),
      api<{ users: User[] }>("/api/users"),
    ]);
    setTasks(t.tasks);
    setProjects(p.projects);
    setUsers(u.users);
    if (!form.projectId && p.projects[0]) {
      setForm((f) => ({ ...f, projectId: p.projects[0].id }));
    }
  }

  useEffect(() => {
    load().catch(console.error);
  }, [filter.projectId, filter.assigneeId]);

  const grouped = useMemo(() => {
    const map: Record<string, Task[]> = {
      todo: [],
      in_progress: [],
      blocked: [],
      done: [],
    };
    for (const t of tasks) {
      (map[t.status] ?? map.todo).push(t);
    }
    return map;
  }, [tasks]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    await api("/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        assigneeId: form.assigneeId || null,
      }),
    });
    setOpen(false);
    setForm((f) => ({
      ...f,
      title: "",
      description: "",
      dueDate: "",
      status: "todo",
      priority: "medium",
      assigneeId: "",
    }));
    await load();
  }

  async function moveTask(id: string, status: string) {
    await api(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    await load();
  }

  return (
    <div>
      <PageHeader
        eyebrow="Work"
        title="Tasks"
        description="Board by status with assignees, priorities, and due dates."
        actions={
          <button className="btn btn-signal" onClick={() => setOpen(true)}>
            New task
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-3">
        <select
          className="field max-w-[220px]"
          value={filter.projectId}
          onChange={(e) => setFilter({ ...filter, projectId: e.target.value })}
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          className="field max-w-[220px]"
          value={filter.assigneeId}
          onChange={(e) => setFilter({ ...filter, assigneeId: e.target.value })}
        >
          <option value="">All assignees</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {COLUMNS.map((col) => (
          <section key={col.key} className="panel rounded-[22px] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">{col.label}</h2>
              <span className="pill">{grouped[col.key].length}</span>
            </div>
            <div className="space-y-2">
              {grouped[col.key].map((t) => (
                <article key={t.id} className="surface rounded-xl p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-snug">{t.title}</h3>
                    <StatusPill value={t.priority} />
                  </div>
                  <div className="mb-3 flex items-center gap-2 text-sm text-muted">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: t.projectColor ?? "#1B7A4E" }}
                    />
                    <span className="truncate">{t.projectName}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    {t.assigneeName ? (
                      <Avatar
                        name={t.assigneeName}
                        color={t.assigneeColor ?? "#1B7A4E"}
                        size={28}
                      />
                    ) : (
                      <span className="text-xs text-muted">Unassigned</span>
                    )}
                    <span className="text-xs font-semibold">{t.dueDate ?? "—"}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {COLUMNS.filter((c) => c.key !== t.status).map((c) => (
                      <button
                        key={c.key}
                        className="rounded-full border border-[var(--line)] px-2 py-0.5 text-[11px] font-semibold hover:bg-white/70"
                        onClick={() => moveTask(t.id, c.key)}
                      >
                        → {c.label}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Modal open={open} title="New task" onClose={() => setOpen(false)}>
        <form className="space-y-3" onSubmit={onCreate}>
          <div>
            <label className="label">Title</label>
            <input
              className="field"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Project</label>
            <select
              className="field"
              required
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="field min-h-[80px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Priority</label>
              <select
                className="field"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="label">Assignee</label>
              <select
                className="field"
                value={form.assigneeId}
                onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Due date</label>
            <input
              type="date"
              className="field"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <button className="btn btn-primary w-full" type="submit">
            Create task
          </button>
        </form>
      </Modal>
    </div>
  );
}
