export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  on_hold: "On hold",
  done: "Done",
  archived: "Archived",
  todo: "To do",
  in_progress: "In progress",
  blocked: "Blocked",
  upcoming: "Upcoming",
  reached: "Reached",
  missed: "Missed",
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
