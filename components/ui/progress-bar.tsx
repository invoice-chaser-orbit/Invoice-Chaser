import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div className={cn("h-2 w-full rounded-full bg-neutral-100", className)}>
      <div
        className="h-2 rounded-full bg-primary-500 transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ConfidenceMeter({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ProgressBar value={value} className="w-16" />
      <span className="text-caption text-neutral-500 tabular-nums">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}
