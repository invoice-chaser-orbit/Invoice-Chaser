import type { DecisionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_META: Record<DecisionStatus, { label: string; tone: "success" | "warning" | "danger" }> = {
  auto_executed: { label: "Auto-executed", tone: "success" },
  pending_approval: { label: "Pending approval", tone: "warning" },
  ask_human: { label: "Needs input", tone: "danger" },
};

const toneClasses = {
  success: "bg-success-bg text-success-text border-success-border",
  warning: "bg-warning-bg text-warning-text border-warning-border",
  danger: "bg-danger-bg text-danger-text border-danger-border",
  info: "bg-info-bg text-info-text border-info-bg",
  neutral: "bg-neutral-100 text-neutral-700 border-neutral-200",
} as const;

export function Tag({
  tone = "neutral",
  children,
  className,
}: {
  tone?: keyof typeof toneClasses;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-caption",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusTag({
  status,
  className,
}: {
  status: DecisionStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <Tag tone={meta.tone} className={className}>
      {meta.label}
    </Tag>
  );
}
