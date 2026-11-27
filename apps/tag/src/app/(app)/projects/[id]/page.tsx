"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Check, Circle, Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { StatusPill } from "@/components/StatusPill";
import { ProgressBar } from "@/components/ProgressBar";
import { Avatar } from "@/components/Avatar";
import { api } from "@/lib/api-client";

type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  milestoneId: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeColor: string | null;
};

type Milestone = {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  status: string;
  liveStatus: string;
  progress: {
    done: number;
    total: number;
    percent: number;
    complete: boolean;
  };
};

type Detail = {
  project: {
    id: string;
    name: string;
    description: string;
    status: string;
    color: string;
    ownerName: string | null;
    dueDate: string | null;
  };
  tasks: Task[];
  milestones: Milestone[];
  progress: { done: number; total: number; percent: number; complete: boolean };
  currentMilestone: {
    id: string;
    title: string;
    dueDate: string | null;
    overdue: boolean;
    progress: { done: number; total: number; percent: number };
  } | null;
};

type User = { id: string; name: string; avatarColor: string };

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Detail | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [taskOpen, setTaskOpen] = useState(false);
  const [msOpen, setMsOpen] = useState(false);
  const [focusMilestone, setFocusMilestone] = useState<string>("");
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assigneeId: "",
    dueDate: "",
    milestoneId: "",
  });
  const [msForm, setMsForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "upcoming",
  });

  async function load() {
    const [d, u] = await Promise.all([
      api<Detail>(`/api/projects/${params.id}`),
      api<{ users: User[] }>("/api/users"),
    ]);
    setData(d);
    setUsers(u.users);
    if (!focusMilestone && d.currentMilestone) {
      setFocusMilestone(d.currentMilestone.id);
    }
  }

  useEffect(() => {
    if (params.id) load().catch(console.error);
  }, [params.id]);

  const unscoped = useMemo(
    () => data?.tasks.filter((t) => !t.milestoneId) ?? [],
    [data],
  );

  async function createTask(e: FormEvent) {
    e.preventDefault();
    await api("/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        ...taskForm,
        projectId: params.id,
        assigneeId: taskForm.assigneeId || null,
        milestoneId: taskForm.milestoneId || null,
      }),
    });
    setTaskOpen(false);
    setTaskForm({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      assigneeId: "",
      dueDate: "",
      milestoneId: focusMilestone || "",
    });
    await load();
  }

  async function createMilestone(e: FormEvent) {
    e.preventDefault();
    await api("/api/milestones", {
      method: "POST",
      body: JSON.stringify({ ...msForm, projectId: params.id }),
    });
    setMsOpen(false);
    setMsForm({ title: "", description: "", dueDate: "", status: "upcoming" });
    await load();
  }

  async function toggleStep(task: Task) {
    const next = task.status === "done" ? "todo" : "done";
    await api(`/api/tasks/${task.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: next }),
    });
    await load();
  }

  async function setTaskStatus(taskId: string, status: string) {
    await api(`/api/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    await load();
  }

  function openStepFor(milestoneId: string) {
    setFocusMilestone(milestoneId);
    setTaskForm((f) => ({ ...f, milestoneId }));
    setTaskOpen(true);
  }

  if (!data) return <p className="text-muted">Loading project…</p>;
  const { project, milestones, progress, currentMilestone } = data;

  return (
    <div>
      <PageHeader
        eyebrow="Project"
        title={project.name}
        description={project.description}
        actions={
          <>
            <Link href="/projects" className="btn btn-ghost">
              All projects
            </Link>
            <Link href="/calendar" className="btn btn-ghost">
              Calendar
            </Link>
            <button className="btn btn-ghost" onClick={() => setMsOpen(true)}>
              Add milestone
            </button>
            <button
              className="btn btn-signal"
              onClick={() =>
                openStepFor(focusMilestone || currentMilestone?.id || "")
              }
            >
              Add step
            </button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span
          className="h-3 w-3 rounded-full"
          style={{ background: project.color }}
        />
        <StatusPill value={project.status} />
        <span className="text-sm text-muted">Owner: {project.ownerName}</span>
        <span className="text-sm text-muted">Due: {project.dueDate ?? "—"}</span>
      </div>

      <section className="panel mb-5 rounded-[22px] p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
              Project progress
            </div>
            <div className="brand-mark mt-1 text-2xl">
              {progress.percent}% complete
            </div>
          </div>
          <div className="w-full max-w-sm">
            <ProgressBar
              done={progress.done}
              total={progress.total}
              percent={progress.percent}
            />
          </div>
        </div>
        {currentMilestone ? (
          <div className="rounded-xl border border-[rgba(184,240,0,0.45)] bg-[rgba(184,240,0,0.16)] px-4 py-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-ink">
              <span className="signal-dot" />
              Current milestone
              {currentMilestone.overdue ? (
                <span className="pill bg-[rgba(194,65,12,0.16)] text-amber">
                  Overdue
                </span>
              ) : null}
            </div>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="brand-mark text-2xl leading-none">
                  {currentMilestone.title}
                </div>
                <div className="mt-1 text-sm text-muted">
                  Due {currentMilestone.dueDate ?? "—"} ·{" "}
                  {currentMilestone.progress.done}/
                  {currentMilestone.progress.total} steps done
                </div>
              </div>
              <button
                className="btn btn-ghost px-3 py-1 text-sm"
                onClick={() => setFocusMilestone(currentMilestone.id)}
              >
                Jump to checklist
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">
            All milestones complete — or add a milestone to start a checklist.
          </p>
        )}
      </section>

      <div className="space-y-4">
        {milestones.map((m) => {
          const steps = data.tasks.filter((t) => t.milestoneId === m.id);
          const isCurrent = currentMilestone?.id === m.id;
          const highlighted = focusMilestone === m.id || isCurrent;
          return (
            <section
              key={m.id}
              id={`milestone-${m.id}`}
              className={`panel rounded-[22px] p-5 ${
                isCurrent
                  ? "ring-2 ring-[rgba(184,240,0,0.55)]"
                  : highlighted
                    ? "ring-1 ring-[rgba(27,122,78,0.35)]"
                    : ""
              }`}
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {isCurrent ? (
                      <span className="pill bg-[rgba(184,240,0,0.35)] text-ink">
                        Current
                      </span>
                    ) : null}
                    <StatusPill value={m.liveStatus} />
                    {m.progress.complete ? null : m.progress.total > 0 ? (
                      <span className="pill text-amber">Incomplete</span>
                    ) : (
                      <span className="pill">No steps yet</span>
                    )}
                  </div>
                  <h2 className="brand-mark text-3xl leading-none">{m.title}</h2>
                  {m.description ? (
                    <p className="mt-2 text-sm text-muted">{m.description}</p>
                  ) : null}
                  <div className="mt-2 text-sm text-muted">
                    Due {m.dueDate ?? "—"}
                  </div>
                </div>
                <div className="w-full max-w-xs">
                  <ProgressBar
                    done={m.progress.done}
                    total={m.progress.total}
                    percent={m.progress.percent}
                  />
                  <button
                    className="btn btn-ghost mt-3 w-full"
                    onClick={() => openStepFor(m.id)}
                  >
                    <Plus size={16} />
                    Add step
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {steps.length === 0 ? (
                  <p className="text-sm text-muted">
                    No checklist steps yet. Add the work that unlocks this
                    milestone.
                  </p>
                ) : (
                  steps.map((t) => {
                    const done = t.status === "done";
                    return (
                      <div
                        key={t.id}
                        className={`surface flex flex-wrap items-center gap-3 rounded-xl px-3 py-3 ${
                          done ? "opacity-70" : ""
                        }`}
                      >
                        <button
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                            done
                              ? "border-verdant bg-verdant text-white"
                              : "border-[var(--line)] bg-white/70 text-muted"
                          }`}
                          onClick={() => toggleStep(t)}
                          title={done ? "Mark incomplete" : "Mark done"}
                        >
                          {done ? <Check size={16} /> : <Circle size={16} />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`font-semibold ${done ? "line-through" : ""}`}
                          >
                            {t.title}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                            <StatusPill value={t.priority} />
                            <StatusPill value={t.status} />
                            <span>{t.dueDate ?? "No due date"}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {t.assigneeName ? (
                            <Avatar
                              name={t.assigneeName}
                              color={t.assigneeColor ?? "#1B7A4E"}
                              size={30}
                            />
                          ) : (
                            <span className="text-xs text-muted">Unassigned</span>
                          )}
                          <select
                            className="field max-w-[140px] py-1 text-sm"
                            value={t.status}
                            onChange={(e) => setTaskStatus(t.id, e.target.value)}
                          >
                            <option value="todo">To do</option>
                            <option value="in_progress">In progress</option>
                            <option value="blocked">Blocked</option>
                            <option value="done">Done</option>
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}

        {unscoped.length > 0 ? (
          <section className="panel rounded-[22px] p-5">
            <h2 className="brand-mark mb-3 text-2xl">Unscoped tasks</h2>
            <p className="mb-3 text-sm text-muted">
              Not linked to a milestone yet — assign them when you know the
              target.
            </p>
            <div className="space-y-2">
              {unscoped.map((t) => (
                <div
                  key={t.id}
                  className="surface flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-3"
                >
                  <div>
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-sm text-muted">{t.dueDate ?? "—"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill value={t.status} />
                    {t.assigneeName ? (
                      <Avatar
                        name={t.assigneeName}
                        color={t.assigneeColor ?? "#1B7A4E"}
                        size={28}
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <Modal open={taskOpen} title="Add checklist step" onClose={() => setTaskOpen(false)}>
        <form className="space-y-3" onSubmit={createTask}>
          <div>
            <label className="label">Step title</label>
            <input
              className="field"
              required
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Milestone</label>
            <select
              className="field"
              value={taskForm.milestoneId}
              onChange={(e) =>
                setTaskForm({ ...taskForm, milestoneId: e.target.value })
              }
            >
              <option value="">Unscoped</option>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="field min-h-[80px]"
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm({ ...taskForm, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Priority</label>
              <select
                className="field"
                value={taskForm.priority}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, priority: e.target.value })
                }
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
                value={taskForm.assigneeId}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, assigneeId: e.target.value })
                }
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
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
            />
          </div>
          <button className="btn btn-primary w-full" type="submit">
            Add step
          </button>
        </form>
      </Modal>

      <Modal open={msOpen} title="Add milestone" onClose={() => setMsOpen(false)}>
        <form className="space-y-3" onSubmit={createMilestone}>
          <div>
            <label className="label">Title</label>
            <input
              className="field"
              required
              value={msForm.title}
              onChange={(e) => setMsForm({ ...msForm, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="field min-h-[80px]"
              value={msForm.description}
              onChange={(e) =>
                setMsForm({ ...msForm, description: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Due date</label>
            <input
              type="date"
              className="field"
              value={msForm.dueDate}
              onChange={(e) => setMsForm({ ...msForm, dueDate: e.target.value })}
            />
          </div>
          <button className="btn btn-primary w-full" type="submit">
            Create milestone
          </button>
        </form>
      </Modal>
    </div>
  );
}
