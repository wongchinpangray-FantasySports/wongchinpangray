"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { StatusPill } from "@/components/StatusPill";
import { ProgressBar } from "@/components/ProgressBar";
import { api } from "@/lib/api-client";

type Project = {
  id: string;
  name: string;
  description: string;
  status: string;
  color: string;
  ownerName: string | null;
  dueDate: string | null;
  progress?: { done: number; total: number; percent: number };
  currentMilestone?: {
    id: string;
    title: string;
    percent: number;
    overdue: boolean;
  } | null;
};

type User = { id: string; name: string };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "active",
    color: "#1B7A4E",
    ownerId: "",
    dueDate: "",
  });

  async function load() {
    const [p, u] = await Promise.all([
      api<{ projects: Project[] }>("/api/projects"),
      api<{ users: User[] }>("/api/users"),
    ]);
    setProjects(p.projects);
    setUsers(u.users);
    if (!form.ownerId && u.users[0]) {
      setForm((f) => ({ ...f, ownerId: u.users[0].id }));
    }
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    await api("/api/projects", {
      method: "POST",
      body: JSON.stringify(form),
    });
    setOpen(false);
    setForm((f) => ({ ...f, name: "", description: "", dueDate: "" }));
    await load();
  }

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Projects"
        description="Track initiatives with milestone checklists, live progress, and owners."
        actions={
          <button className="btn btn-signal" onClick={() => setOpen(true)}>
            New project
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((p, i) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className={`panel animate-rise animate-rise-delay-${Math.min(i, 3)} group rounded-[22px] p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow)]`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <span
                className="mt-1 h-3 w-3 rounded-full"
                style={{ background: p.color }}
              />
              <StatusPill value={p.status} />
            </div>
            <h2 className="brand-mark text-3xl leading-none group-hover:text-verdant-deep">
              {p.name}
            </h2>
            <p className="mt-3 line-clamp-3 text-sm text-muted">{p.description}</p>
            {p.progress ? (
              <div className="mt-4">
                <ProgressBar
                  compact
                  done={p.progress.done}
                  total={p.progress.total}
                  percent={p.progress.percent}
                />
              </div>
            ) : null}
            {p.currentMilestone ? (
              <div className="mt-3 text-sm">
                <span className="font-semibold text-ink">Current: </span>
                <span className="text-muted">
                  {p.currentMilestone.title}
                  {p.currentMilestone.overdue ? " · overdue" : ""}
                </span>
              </div>
            ) : (
              <div className="mt-3 text-sm text-muted">No open milestone</div>
            )}
            <div className="mt-4 flex items-center justify-between text-sm text-muted">
              <span>{p.ownerName ?? "Unassigned"}</span>
              <span>{p.dueDate ?? "No due date"}</span>
            </div>
          </Link>
        ))}
      </div>

      <Modal open={open} title="New project" onClose={() => setOpen(false)}>
        <form className="space-y-3" onSubmit={onCreate}>
          <div>
            <label className="label">Name</label>
            <input
              className="field"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="field min-h-[90px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Status</label>
              <select
                className="field"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="on_hold">On hold</option>
                <option value="done">Done</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="label">Color</label>
              <input
                type="color"
                className="field h-[44px] p-1"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Owner</label>
              <select
                className="field"
                value={form.ownerId}
                onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
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
          </div>
          <button className="btn btn-primary w-full" type="submit">
            Create project
          </button>
        </form>
      </Modal>
    </div>
  );
}
