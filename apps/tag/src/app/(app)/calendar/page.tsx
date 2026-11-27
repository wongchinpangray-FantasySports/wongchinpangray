"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusPill } from "@/components/StatusPill";
import { api } from "@/lib/api-client";
import {
  currentMilestone,
  milestoneProgress,
} from "@/lib/progress";

type Task = {
  id: string;
  title: string;
  dueDate: string | null;
  status: string;
  milestoneId: string | null;
  projectId: string;
  projectName: string | null;
  projectColor: string | null;
};

type Milestone = {
  id: string;
  title: string;
  dueDate: string | null;
  status: string;
  projectId: string;
  projectName: string | null;
  projectColor: string | null;
};

type Project = {
  id: string;
  name: string;
  color: string;
  status: string;
};

export default function CalendarPage() {
  const [cursor, setCursor] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Date>(new Date());
  const [filterProject, setFilterProject] = useState("");

  useEffect(() => {
    Promise.all([
      api<{ tasks: Task[] }>("/api/tasks"),
      api<{ milestones: Milestone[] }>("/api/milestones"),
      api<{ projects: Project[] }>("/api/projects"),
    ]).then(([t, m, p]) => {
      setTasks(t.tasks);
      setMilestones(m.milestones);
      setProjects(p.projects);
    });
  }, []);

  const filteredTasks = useMemo(
    () =>
      filterProject
        ? tasks.filter((t) => t.projectId === filterProject)
        : tasks,
    [tasks, filterProject],
  );
  const filteredMilestones = useMemo(
    () =>
      filterProject
        ? milestones.filter((m) => m.projectId === filterProject)
        : milestones,
    [milestones, filterProject],
  );

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const enrichedMilestones = useMemo(
    () =>
      filteredMilestones.map((m) => ({
        ...m,
        progress: milestoneProgress(m.id, filteredTasks),
      })),
    [filteredMilestones, filteredTasks],
  );

  const currentByProject = useMemo(() => {
    const map = new Map<string, ReturnType<typeof currentMilestone>>();
    const projectIds = [...new Set(filteredMilestones.map((m) => m.projectId))];
    for (const pid of projectIds) {
      const ms = filteredMilestones.filter((m) => m.projectId === pid);
      const ts = filteredTasks.filter((t) => t.projectId === pid);
      map.set(pid, currentMilestone(ms, ts));
    }
    return map;
  }, [filteredMilestones, filteredTasks]);

  function itemsFor(day: Date) {
    const key = format(day, "yyyy-MM-dd");
    const dayTasks = filteredTasks.filter((t) => t.dueDate === key);
    const dayMs = enrichedMilestones.filter((m) => m.dueDate === key);
    return { dayTasks, dayMs };
  }

  const selectedKey = format(selected, "yyyy-MM-dd");
  const selectedTasks = filteredTasks.filter((t) => t.dueDate === selectedKey);
  const selectedMs = enrichedMilestones.filter((m) => m.dueDate === selectedKey);

  return (
    <div>
      <PageHeader
        eyebrow="Schedule"
        title="Calendar"
        description="Milestones and checklist steps by due date — current milestone and incomplete work stay visible."
        actions={
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-ghost" onClick={() => setCursor(subMonths(cursor, 1))}>
              Prev
            </button>
            <button className="btn btn-ghost" onClick={() => setCursor(new Date())}>
              Today
            </button>
            <button className="btn btn-ghost" onClick={() => setCursor(addMonths(cursor, 1))}>
              Next
            </button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="brand-mark text-3xl">{format(cursor, "MMMM yyyy")}</div>
        <select
          className="field max-w-[240px]"
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <section className="panel mb-5 rounded-[22px] p-4">
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted">
          Current milestones
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[...currentByProject.entries()].length === 0 ? (
            <p className="text-sm text-muted">No open milestones.</p>
          ) : (
            [...currentByProject.entries()].map(([pid, cur]) => {
              if (!cur) return null;
              const project = projects.find((p) => p.id === pid);
              return (
                <Link
                  key={pid}
                  href={`/projects/${pid}`}
                  className="surface rounded-xl p-3 transition hover:bg-white/80"
                >
                  <div className="mb-1 flex items-center gap-2 text-sm text-muted">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: project?.color ?? "#1B7A4E" }}
                    />
                    {project?.name}
                    {cur.overdue ? (
                      <span className="pill bg-[rgba(194,65,12,0.14)] text-amber">
                        Overdue
                      </span>
                    ) : (
                      <span className="pill bg-[rgba(184,240,0,0.28)]">Current</span>
                    )}
                  </div>
                  <div className="font-bold">{cur.title}</div>
                  <div className="mt-2">
                    <ProgressBar
                      compact
                      done={cur.progress.done}
                      total={cur.progress.total}
                      percent={cur.progress.percent}
                    />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="panel overflow-hidden rounded-[22px]">
          <div className="grid grid-cols-7 border-b border-[var(--line)] bg-white/40 text-center text-xs font-bold uppercase tracking-[0.12em] text-muted">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="px-2 py-3">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const { dayTasks, dayMs } = itemsFor(day);
              const inMonth = isSameMonth(day, cursor);
              const active = isSameDay(day, selected);
              const today = isSameDay(day, new Date());
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelected(day)}
                  className={`min-h-[96px] border-b border-r border-[var(--line)] p-2 text-left transition hover:bg-white/50 ${
                    inMonth ? "" : "opacity-40"
                  } ${active ? "bg-[rgba(184,240,0,0.22)]" : ""}`}
                >
                  <div
                    className={`mb-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                      today ? "bg-ink text-paper" : ""
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {dayMs.slice(0, 1).map((m) => {
                      const isCurrent =
                        currentByProject.get(m.projectId)?.id === m.id;
                      const incomplete = !m.progress.complete;
                      return (
                        <div
                          key={m.id}
                          className={`truncate rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white ${
                            incomplete ? "ring-1 ring-[rgba(194,65,12,0.5)]" : ""
                          }`}
                          style={{ background: m.projectColor ?? "#0C4A6E" }}
                          title={`${m.title}${isCurrent ? " (current)" : ""}${incomplete ? " · incomplete" : ""}`}
                        >
                          ◆ {isCurrent ? "● " : ""}
                          {m.title}
                          {incomplete ? ` ${m.progress.percent}%` : " ✓"}
                        </div>
                      );
                    })}
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className={`truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                          t.status === "done" ? "line-through opacity-60" : ""
                        }`}
                        style={{
                          background: `${t.projectColor ?? "#1B7A4E"}22`,
                          color: t.projectColor ?? "#1B7A4E",
                        }}
                      >
                        {t.status === "done" ? "✓ " : ""}
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length + dayMs.length > 3 ? (
                      <div className="text-[10px] text-muted">
                        +{dayTasks.length + dayMs.length - 3} more
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel rounded-[22px] p-5">
          <h2 className="brand-mark mb-1 text-2xl">
            {format(selected, "EEE, MMM d")}
          </h2>
          <p className="mb-4 text-sm text-muted">Selected day detail</p>

          <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">
            Milestones
          </h3>
          <div className="mb-5 space-y-2">
            {selectedMs.length === 0 ? (
              <p className="text-sm text-muted">None</p>
            ) : (
              selectedMs.map((m) => {
                const isCurrent = currentByProject.get(m.projectId)?.id === m.id;
                return (
                  <Link
                    key={m.id}
                    href={`/projects/${m.projectId}`}
                    className="surface block rounded-xl px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-semibold">{m.title}</div>
                      {isCurrent ? (
                        <span className="pill bg-[rgba(184,240,0,0.28)]">Current</span>
                      ) : null}
                      {!m.progress.complete ? (
                        <span className="pill text-amber">Incomplete</span>
                      ) : (
                        <StatusPill value="reached" />
                      )}
                    </div>
                    <div className="mt-1 text-sm text-muted">{m.projectName}</div>
                    <div className="mt-2">
                      <ProgressBar
                        compact
                        done={m.progress.done}
                        total={m.progress.total}
                        percent={m.progress.percent}
                      />
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">
            Checklist steps
          </h3>
          <div className="space-y-2">
            {selectedTasks.length === 0 ? (
              <p className="text-sm text-muted">None</p>
            ) : (
              selectedTasks.map((t) => (
                <div key={t.id} className="surface rounded-xl px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div
                      className={`font-semibold ${t.status === "done" ? "line-through opacity-70" : ""}`}
                    >
                      {t.title}
                    </div>
                    <StatusPill value={t.status} />
                  </div>
                  <div className="text-sm text-muted">
                    {t.projectName}
                    {t.status !== "done" ? " · incomplete" : ""}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
