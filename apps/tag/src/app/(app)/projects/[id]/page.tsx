"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { StatusPill } from "@/components/StatusPill";
import { api } from "@/lib/api-client";

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
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
    assigneeId: string | null;
  }>;
  milestones: Array<{
    id: string;
    title: string;
    dueDate: string | null;
    status: string;
  }>;
};

type User = { id: string; name: string };

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Detail | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [taskOpen, setTaskOpen] = useState(false);
  const [msOpen, setMsOpen] = useState(false);
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
  }

  useEffect(() => {
    if (params.id) load().catch(console.error);
  }, [params.id]);

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
      milestoneId: "",
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

  if (!data) return <p className="text-muted">Loading project…</p>;
  const { project, tasks, milestones } = data;

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
            <button className="btn btn-ghost" onClick={() => setMsOpen(true)}>
              Add milestone
            </button>
            <button className="btn btn-signal" onClick={() => setTaskOpen(true)}>
              Add task
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

      <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <section className="panel rounded-[22px] p-5">
          <h2 className="brand-mark mb-4 text-2xl">Tasks</h2>
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <p className="text-muted">No tasks yet.</p>
            ) : (
              tasks.map((t) => (
                <div
                  key={t.id}
                  className="surface flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-3"
                >
                  <div>
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-sm text-muted">{t.dueDate ?? "No due date"}</div>
                  </div>
                  <div className="flex gap-2">
                    <StatusPill value={t.priority} />
                    <StatusPill value={t.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel rounded-[22px] p-5">
          <h2 className="brand-mark mb-4 text-2xl">Milestones</h2>
          <div className="space-y-3">
            {milestones.length === 0 ? (
              <p className="text-muted">No milestones yet.</p>
            ) : (
              milestones.map((m) => (
                <div key={m.id} className="surface rounded-xl px-3 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold">{m.title}</div>
                    <StatusPill value={m.status} />
                  </div>
                  <div className="mt-1 text-sm text-muted">{m.dueDate ?? "—"}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <Modal open={taskOpen} title="Add task" onClose={() => setTaskOpen(false)}>
        <form className="space-y-3" onSubmit={createTask}>
          <div>
            <label className="label">Title</label>
            <input
              className="field"
              required
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            />
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
              <label className="label">Status</label>
              <select
                className="field"
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
              >
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
            </div>
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
          </div>
          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="label">Due date</label>
              <input
                type="date"
                className="field"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              />
            </div>
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
              <option value="">None</option>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary w-full" type="submit">
            Create task
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Due date</label>
              <input
                type="date"
                className="field"
                value={msForm.dueDate}
                onChange={(e) => setMsForm({ ...msForm, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="field"
                value={msForm.status}
                onChange={(e) => setMsForm({ ...msForm, status: e.target.value })}
              >
                <option value="upcoming">Upcoming</option>
                <option value="reached">Reached</option>
                <option value="missed">Missed</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary w-full" type="submit">
            Create milestone
          </button>
        </form>
      </Modal>
    </div>
  );
}
