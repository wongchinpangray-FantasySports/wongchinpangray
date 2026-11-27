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
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api-client";

type Task = {
  id: string;
  title: string;
  dueDate: string | null;
  status: string;
  projectName: string | null;
  projectColor: string | null;
};

type Milestone = {
  id: string;
  title: string;
  dueDate: string | null;
  projectName: string | null;
  projectColor: string | null;
};

export default function CalendarPage() {
  const [cursor, setCursor] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selected, setSelected] = useState<Date>(new Date());

  useEffect(() => {
    Promise.all([
      api<{ tasks: Task[] }>("/api/tasks"),
      api<{ milestones: Milestone[] }>("/api/milestones"),
    ]).then(([t, m]) => {
      setTasks(t.tasks);
      setMilestones(m.milestones);
    });
  }, []);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  function itemsFor(day: Date) {
    const key = format(day, "yyyy-MM-dd");
    const dayTasks = tasks.filter((t) => t.dueDate === key);
    const dayMs = milestones.filter((m) => m.dueDate === key);
    return { dayTasks, dayMs };
  }

  const selectedKey = format(selected, "yyyy-MM-dd");
  const selectedTasks = tasks.filter((t) => t.dueDate === selectedKey);
  const selectedMs = milestones.filter((m) => m.dueDate === selectedKey);

  return (
    <div>
      <PageHeader
        eyebrow="Schedule"
        title="Calendar"
        description="Tasks and milestones by due date."
        actions={
          <div className="flex gap-2">
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

      <div className="mb-4 brand-mark text-3xl">{format(cursor, "MMMM yyyy")}</div>

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
                    {dayMs.slice(0, 1).map((m) => (
                      <div
                        key={m.id}
                        className="truncate rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white"
                        style={{ background: m.projectColor ?? "#0C4A6E" }}
                      >
                        ◆ {m.title}
                      </div>
                    ))}
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className="truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                        style={{
                          background: `${t.projectColor ?? "#1B7A4E"}22`,
                          color: t.projectColor ?? "#1B7A4E",
                        }}
                      >
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
              selectedMs.map((m) => (
                <div key={m.id} className="surface rounded-xl px-3 py-2">
                  <div className="font-semibold">{m.title}</div>
                  <div className="text-sm text-muted">{m.projectName}</div>
                </div>
              ))
            )}
          </div>

          <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">
            Tasks
          </h3>
          <div className="space-y-2">
            {selectedTasks.length === 0 ? (
              <p className="text-sm text-muted">None</p>
            ) : (
              selectedTasks.map((t) => (
                <div key={t.id} className="surface rounded-xl px-3 py-2">
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-sm text-muted">
                    {t.projectName} · {t.status}
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
