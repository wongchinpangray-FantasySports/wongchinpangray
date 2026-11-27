export function ProgressBar({
  done,
  total,
  percent,
  compact,
}: {
  done: number;
  total: number;
  percent: number;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "min-w-[120px]" : "w-full"}>
      <div className="mb-1 flex items-center justify-between gap-2 text-xs font-bold tracking-wide text-muted">
        <span>
          {done}/{total} done
        </span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[rgba(12,27,42,0.08)]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#1b7a4e,#b8f000)] transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
