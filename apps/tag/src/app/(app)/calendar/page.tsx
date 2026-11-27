"use client";

import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
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

type CalView = "month" | "week" | "agenda";

const VIEW_KEY = "tag.calendar.view";

function readStoredView(): CalView {
  if (typeof window === "undefined") return "month";
  const v = window.localStorage.getItem(VIEW_KEY);
  if (v === "month" || v === "week" || v === "agenda") return v;
  return "month";
}

export default function CalendarPage() {
  const [cursor, setCursor] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Date>(new Date());
  const [filterProject, setFilterProject] = useState("");
  const [view, setView] = useState<CalView>("month");

  useEffect(() => {
    setView(readStoredView());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(VIEW_KEY, view);
    }
  }, [view]);

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

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor);
    const end = endOfWeek(cursor);
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

  const agendaItems = useMemo(() => {
    const rangeStart =
      view === "week" ? startOfWeek(cursor) : startOfMonth(cursor);
    const rangeEnd = view === "week" ? endOfWeek(cursor) : endOfMonth(cursor);
    // Agenda always shows from today-ish within a wider window: current month + next
    const agendaStart = view === "agenda" ? startOfMonth(cursor) : rangeStart;
    const agendaEnd =
      view === "agenda" ? endOfMonth(addMonths(cursor, 1)) : rangeEnd;

    type Item = {
      date: string;
      kind: "milestone" | "task";
      title: string;
      projectId: string;
      projectName: string | null;
      projectColor: string | null;
      status: string;
      incomplete: boolean;
      href: string;
    };

    const items: Item[] = [];
    for (const m of enrichedMilestones) {
      if (!m.dueDate) continue;
      const d = parseISO(m.dueDate);
      if (!isWithinInterval(d, { start: agendaStart, end: agendaEnd })) continue;
      items.push({
        date: m.dueDate,
        kind: "milestone",
        title: m.title,
        projectId: m.projectId,
        projectName: m.projectName,
        projectColor: m.projectColor,
        status: m.progress.complete ? "reached" : "upcoming",
        incomplete: !m.progress.complete,
        href: `/projects/${m.projectId}`,
      });
    }
    for (const t of filteredTasks) {
      if (!t.dueDate) continue;
      const d = parseISO(t.dueDate);
      if (!isWithinInterval(d, { start: agendaStart, end: agendaEnd })) continue;
      items.push({
        date: t.dueDate,
        kind: "task",
        title: t.title,
        projectId: t.projectId,
        projectName: t.projectName,
        projectColor: t.projectColor,
        status: t.status,
        incomplete: t.status !== "done",
        href: `/projects/${t.projectId}`,
      });
    }
    items.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
    return items;
  }, [view, cursor, enrichedMilestones, filteredTasks]);

  function goPrev() {
    if (view === "week") setCursor(subWeeks(cursor, 1));
    else setCursor(subMonths(cursor, 1));
  }
  function goNext() {
    if (view === "week") setCursor(addWeeks(cursor, 1));
    else setCursor(addMonths(cursor, 1));
  }

  const titleLabel =
    view === "week"
      ? `${format(startOfWeek(cursor), "MMM d")} – ${format(endOfWeek(cursor), "MMM d, yyyy")}`
      : view === "agenda"
        ? `${format(cursor, "MMMM yyyy")} agenda`
        : format(cursor, "MMMM yyyy");

  function renderDayGrid(days: Date[], weekMode: boolean) {
    return (
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
            const inMonth = weekMode || isSameMonth(day, cursor);
            const active = isSameDay(day, selected);
            const today = isSameDay(day, new Date());
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelected(day)}
                className={`${weekMode ? "min-h-[140px]" : "min-h-[96px]"} border-b border-r border-[var(--line)] p-2 text-left transition hover:bg-white/50 ${
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
                  {dayMs.slice(0, weekMode ? 3 : 1).map((m) => {
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
                      >
                        ◆ {isCurrent ? "● " : ""}
                        {m.title}
                        {incomplete ? ` ${m.progress.percent}%` : " ✓"}
                      </div>
                    );
                  })}
                  {dayTasks.slice(0, weekMode ? 4 : 2).map((t) => (
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
                </div>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Schedule"
        title="Calendar"
        description="Milestones and checklist steps by due date — switch month, week, or agenda."
        actions={
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-ghost" onClick={goPrev}>
              Prev
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                const today = new Date();
                setCursor(today);
                setSelected(today);
              }}
            >
              Today
            </button>
            <button className="btn btn-ghost" onClick={goNext}>
              Next
            </button>
          </div>
        }
      />

      <div className="panel mb-5 flex flex-col gap-3 rounded-[22px] p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div
          className="inline-flex rounded-full border border-[var(--line)] bg-white/50 p-1"
          role="tablist"
          aria-label="Calendar view"
        >
          {(
            [
              ["month", "Month"],
              ["week", "Week"],
              ["agenda", "Agenda"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={view === id}
              data-testid={`cal-view-${id}`}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                view === id
                  ? "bg-ink text-paper"
                  : "text-muted hover:text-ink"
              }`}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="brand-mark text-2xl sm:text-3xl">{titleLabel}</div>
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

      {view === "agenda" ? (
        <section className="panel rounded-[22px] p-5">
          <h2 className="brand-mark mb-4 text-2xl">Agenda</h2>
          {agendaItems.length === 0 ? (
            <p className="text-muted">Nothing due in this range.</p>
          ) : (
            <div className="space-y-2">
              {agendaItems.map((item) => (
                <Link
                  key={`${item.kind}-${item.title}-${item.date}-${item.projectId}`}
                  href={item.href}
                  className="surface flex flex-wrap items-center justify-between gap-3 rounded-xl px-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                      {item.date} · {item.kind}
                    </div>
                    <div
                      className={`font-semibold ${item.status === "done" ? "line-through opacity-70" : ""}`}
                    >
                      {item.kind === "milestone" ? "◆ " : ""}
                      {item.title}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: item.projectColor ?? "#1B7A4E" }}
                      />
                      {item.projectName}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {item.incomplete ? (
                      <span className="pill text-amber">Incomplete</span>
                    ) : null}
                    <StatusPill value={item.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
          {view === "week"
            ? renderDayGrid(weekDays, true)
            : renderDayGrid(monthDays, false)}

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
                  const isCurrent =
                    currentByProject.get(m.projectId)?.id === m.id;
                  return (
                    <Link
                      key={m.id}
                      href={`/projects/${m.projectId}`}
                      className="surface block rounded-xl px-3 py-2"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-semibold">{m.title}</div>
                        {isCurrent ? (
                          <span className="pill bg-[rgba(184,240,0,0.28)]">
                            Current
                          </span>
                        ) : null}
                        {!m.progress.complete ? (
                          <span className="pill text-amber">Incomplete</span>
                        ) : (
                          <StatusPill value="reached" />
                        )}
                      </div>
                      <div className="mt-1 text-sm text-muted">{m.projectName}</div>
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
                    <div className="text-sm text-muted">{t.projectName}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
