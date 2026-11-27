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
  cpsType?: string | null;
  cpsName?: string | null;
  briefDate?: string | null;
  progress?: { done: number; total: number; percent: number };
  currentMilestone?: {
    id: string;
    title: string;
    percent: number;
    overdue: boolean;
  } | null;
};

type User = { id: string; name: string };

type CpsTemplate = {
  id: string;
  name: string;
  sheetName: string;
  milestoneCount: number;
  stepCount: number;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<CpsTemplate[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#1B7A4E",
    ownerId: "",
    cpsType: "ctmz-normal",
    briefDate: new Date().toISOString().slice(0, 10),
  });

  async function load() {
    const [p, u, t] = await Promise.all([
      api<{ projects: Project[] }>("/api/projects"),
      api<{ users: User[] }>("/api/users"),
      api<{ templates: CpsTemplate[] }>("/api/cps/templates"),
    ]);
    setProjects(p.projects);
    setUsers(u.users);
    setTemplates(t.templates);
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
    setForm((f) => ({
      ...f,
      name: "",
      description: "",
      briefDate: new Date().toISOString().slice(0, 10),
    }));
    await load();
  }

  const selected = templates.find((t) => t.id === form.cpsType);

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Projects"
        description="Create CPS projects from Ray’s planning workbook — pick a type, set Brief in, track milestones."
        actions={
          <button className="btn btn-signal" onClick={() => setOpen(true)}>
            New CPS project
          </button>
        }
      />

      <div className="mb-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            className="panel rounded-2xl p-4 text-left transition hover:-translate-y-0.5"
            onClick={() => {
              setForm((f) => ({
                ...f,
                cpsType: t.id,
                name: f.name || `${t.name} job`,
              }));
              setOpen(true);
            }}
          >
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
              CPS type
            </div>
            <div className="brand-mark mt-1 text-xl leading-none">{t.name}</div>
            <div className="mt-2 text-sm text-muted">
              {t.milestoneCount} milestones · {t.stepCount} steps
            </div>
          </button>
        ))}
      </div>

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
              <div className="flex flex-wrap justify-end gap-1">
                {p.cpsName ? (
                  <span className="pill bg-[rgba(184,240,0,0.28)] text-ink">
                    {p.cpsName}
                  </span>
                ) : null}
                <StatusPill value={p.status} />
              </div>
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
              <span>
                {p.briefDate ? `Brief ${p.briefDate}` : p.dueDate ?? "No due date"}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <Modal open={open} title="New CPS project" onClose={() => setOpen(false)} wide>
        <form className="space-y-3" onSubmit={onCreate}>
          <div>
            <label className="label">CPS type</label>
            <select
              className="field"
              required
              value={form.cpsType}
              onChange={(e) => setForm({ ...form, cpsType: e.target.value })}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.milestoneCount} milestones / {t.stepCount} steps)
                </option>
              ))}
            </select>
            {selected ? (
              <p className="mt-2 text-sm text-muted">
                From workbook sheet <code>{selected.sheetName.trim()}</code>. Seeds
                the full milestone checklist with lead-time dates from Brief in.
              </p>
            ) : null}
          </div>
          <div>
            <label className="label">Project name</label>
            <input
              className="field"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Olay Pack Box — Sale 7"
            />
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
              <label className="label">Brief in date</label>
              <input
                type="date"
                className="field"
                required
                value={form.briefDate}
                onChange={(e) => setForm({ ...form, briefDate: e.target.value })}
              />
            </div>
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
          </div>
          <div>
            <label className="label">Color</label>
            <input
              type="color"
              className="field h-[44px] max-w-[120px] p-1"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />
          </div>
          <button className="btn btn-primary w-full" type="submit">
            Create & seed CPS checklist
          </button>
        </form>
      </Modal>
    </div>
  );
}
