import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/utils";

const STATUS_TONE: Record<string, string> = {
  active: "bg-[rgba(27,122,78,0.14)] text-verdant-deep",
  on_hold: "bg-[rgba(194,65,12,0.12)] text-amber",
  done: "bg-[rgba(12,74,110,0.12)] text-sky",
  archived: "bg-[rgba(91,112,133,0.14)] text-muted",
  todo: "bg-[rgba(12,27,42,0.06)] text-ink",
  in_progress: "bg-[rgba(27,122,78,0.14)] text-verdant-deep",
  blocked: "bg-[rgba(194,65,12,0.14)] text-amber",
  upcoming: "bg-[rgba(184,240,0,0.28)] text-ink",
  reached: "bg-[rgba(27,122,78,0.14)] text-verdant-deep",
  missed: "bg-[rgba(194,65,12,0.14)] text-amber",
  low: "bg-[rgba(91,112,133,0.12)] text-muted",
  medium: "bg-[rgba(12,74,110,0.12)] text-sky",
  high: "bg-[rgba(194,65,12,0.12)] text-amber",
  urgent: "bg-[rgba(194,65,12,0.2)] text-amber",
};

export function StatusPill({ value }: { value: string }) {
  return (
    <span className={`pill ${STATUS_TONE[value] ?? ""}`}>
      {STATUS_LABELS[value] ?? PRIORITY_LABELS[value] ?? value}
    </span>
  );
}
