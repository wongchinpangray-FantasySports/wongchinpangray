"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusPill } from "@/components/StatusPill";
import { Avatar } from "@/components/Avatar";
import { api } from "@/lib/api-client";

type Dash = {
  stats: {
    activeProjects: number;
    openTasks: number;
    overdue: number;
    blocked: number;
  };
  dueSoon: Array<{
    id: string;
    title: string;
    dueDate: string | null;
    priority: string;
    projectName: string | null;
    projectColor: string | null;
  }>;
  overdue: Array<{
    id: string;
    title: string;
    dueDate: string | null;
    projectName: string | null;
  }>;
  mine: Array<{
    id: string;
    title: string;
    status: string;
    dueDate: string | null;
    projectName: string | null;
  }>;
  upcomingMilestones: Array<{
    id: string;
    title: string;
    dueDate: string | null;
    projectName: string | null;
    projectColor: string | null;
  }>;
  pinnedNotes: Array<{
    id: string;
    title: string;
    body: string;
    projectName: string | null;
  }>;
  team: Array<{
    id: string;
    name: string;
    avatarColor: string;
    role: string;
    openTasks: number;
  }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<Dash | null>(null);

  useEffect(() => {
    api<{ /* same */ } & Dash>("/api/dashboard").then(setData).catch(console.error);
  }, []);

  if (!data) {
    return <p className="text-muted">Loading ops board…</p>;
  }

  const metrics = [
    { label: "Active projects", value: data.stats.activeProjects },
    { label: "Open tasks", value: data.stats.openTasks },
    { label: "Overdue", value: data.stats.overdue },
    { label: "Blocked", value: data.stats.blocked },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Today"
        title="Ops board"
        description="What needs attention across projects, people, and deadlines."
        actions={
          <Link href="/tasks" className="btn btn-primary">
            Open tasks
          </Link>
        }
      />

      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={`panel animate-rise animate-rise-delay-${i} rounded-2xl px-4 py-5`}
          >
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
              {m.label}
            </div>
            <div className="brand-mark mt-2 text-4xl">{m.value}</div>
          </div>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="panel animate-rise animate-rise-delay-1 rounded-[22px] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="brand-mark text-2xl">Due soon</h2>
            <Link href="/calendar" className="text-sm font-semibold text-verdant-deep">
              Calendar →
            </Link>
          </div>
          <div className="space-y-2">
            {data.dueSoon.length === 0 ? (
              <p className="text-muted">Nothing due in the next 7 days.</p>
            ) : (
              data.dueSoon.map((t) => (
                <div
                  key={t.id}
                  className="surface flex items-center justify-between gap-3 rounded-xl px-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{t.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: t.projectColor ?? "#1B7A4E" }}
                      />
                      {t.projectName}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusPill value={t.priority} />
                    <span className="text-sm font-semibold">{t.dueDate}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {data.overdue.length > 0 ? (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.12em] text-amber">
                Overdue
              </h3>
              <div className="space-y-2">
                {data.overdue.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-xl bg-[rgba(194,65,12,0.08)] px-3 py-2"
                  >
                    <span className="font-semibold">{t.title}</span>
                    <span className="text-sm text-amber">{t.dueDate}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <div className="space-y-5">
          <section className="panel animate-rise animate-rise-delay-2 rounded-[22px] p-5">
            <h2 className="brand-mark mb-4 text-2xl">My open work</h2>
            <div className="space-y-2">
              {data.mine.length === 0 ? (
                <p className="text-muted">You’re clear.</p>
              ) : (
                data.mine.slice(0, 6).map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{t.title}</div>
                      <div className="text-sm text-muted">{t.projectName}</div>
                    </div>
                    <StatusPill value={t.status} />
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="panel animate-rise animate-rise-delay-3 rounded-[22px] p-5">
            <h2 className="brand-mark mb-4 text-2xl">Milestones</h2>
            <div className="space-y-3">
              {data.upcomingMilestones.length === 0 ? (
                <p className="text-muted">No milestones this week.</p>
              ) : (
                data.upcomingMilestones.map((m) => (
                  <div key={m.id} className="flex items-start gap-3">
                    <span
                      className="mt-1 h-3 w-3 rounded-full"
                      style={{ background: m.projectColor ?? "#1B7A4E" }}
                    />
                    <div>
                      <div className="font-semibold">{m.title}</div>
                      <div className="text-sm text-muted">
                        {m.projectName} · {m.dueDate}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="panel rounded-[22px] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="brand-mark text-2xl">Pinned notes</h2>
            <Link href="/notes" className="text-sm font-semibold text-verdant-deep">
              All notes →
            </Link>
          </div>
          <div className="space-y-3">
            {data.pinnedNotes.map((n) => (
              <article key={n.id} className="surface rounded-xl p-3">
                <h3 className="font-bold">{n.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{n.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel rounded-[22px] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="brand-mark text-2xl">Team load</h2>
            <Link href="/team" className="text-sm font-semibold text-verdant-deep">
              Team →
            </Link>
          </div>
          <div className="space-y-3">
            {data.team.map((u) => (
              <div key={u.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={u.name} color={u.avatarColor} />
                  <div>
                    <div className="font-semibold">{u.name}</div>
                    <div className="text-sm text-muted">{u.role}</div>
                  </div>
                </div>
                <span className="pill">{u.openTasks} open</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
