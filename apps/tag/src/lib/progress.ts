export type ProgressTask = {
  id: string;
  status: string;
  milestoneId: string | null;
  dueDate?: string | null;
};

export type ProgressMilestone = {
  id: string;
  title: string;
  dueDate: string | null;
  status: string;
};

export function isDone(status: string) {
  return status === "done";
}

export function milestoneProgress(
  milestoneId: string,
  tasks: ProgressTask[],
) {
  const steps = tasks.filter((t) => t.milestoneId === milestoneId);
  const done = steps.filter((t) => isDone(t.status)).length;
  const total = steps.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const incomplete = steps.filter((t) => !isDone(t.status));
  return { steps, done, total, percent, incomplete, complete: total > 0 && done === total };
}

export function projectProgress(tasks: ProgressTask[]) {
  const total = tasks.length;
  const done = tasks.filter((t) => isDone(t.status)).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent, complete: total > 0 && done === total };
}

/** Earliest incomplete milestone by due date (then title). */
export function currentMilestone(
  milestones: ProgressMilestone[],
  tasks: ProgressTask[],
  today = new Date().toISOString().slice(0, 10),
) {
  const open = milestones
    .map((m) => ({ m, progress: milestoneProgress(m.id, tasks) }))
    .filter(({ progress, m }) => !progress.complete && m.status !== "reached");

  if (open.length === 0) return null;

  open.sort((a, b) => {
    const ad = a.m.dueDate || "9999-12-31";
    const bd = b.m.dueDate || "9999-12-31";
    if (ad !== bd) return ad.localeCompare(bd);
    return a.m.title.localeCompare(b.m.title);
  });

  const pick = open[0];
  const overdue = Boolean(pick.m.dueDate && pick.m.dueDate < today);
  return { ...pick.m, progress: pick.progress, overdue };
}

export function derivedMilestoneStatus(
  milestone: ProgressMilestone,
  tasks: ProgressTask[],
  today = new Date().toISOString().slice(0, 10),
) {
  const progress = milestoneProgress(milestone.id, tasks);
  if (progress.complete) return "reached";
  if (milestone.dueDate && milestone.dueDate < today && progress.incomplete.length > 0) {
    return "missed";
  }
  return "upcoming";
}
