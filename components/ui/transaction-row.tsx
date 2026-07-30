import Link from "next/link";
import { AvatarCircle } from "@/components/ui/avatar-circle";
import { StatusTag } from "@/components/ui/status-tag";
import { ConfidenceMeter } from "@/components/ui/progress-bar";
import type { DecisionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TransactionRow({
  title,
  subtitle,
  value,
  valueCaption,
  status,
  confidence,
  to,
  className,
}: {
  title: string;
  subtitle: string;
  value: string;
  valueCaption?: string;
  status: DecisionStatus;
  confidence: number;
  to?: string;
  className?: string;
}) {
  const body = (
    <div
      className={cn(
        "flex items-center gap-4 rounded-md px-3 py-3 transition-colors hover:bg-neutral-50",
        className,
      )}
    >
      <AvatarCircle name={title} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-semibold text-neutral-900">
          {title}
        </p>
        <p className="truncate text-caption text-neutral-500">{subtitle}</p>
      </div>
      <div className="hidden sm:block">
        <ConfidenceMeter value={confidence} />
      </div>
      <div className="text-right">
        <p className="text-body font-semibold text-neutral-900 tabular-nums">
          {value}
        </p>
        {valueCaption && (
          <p className="text-caption text-neutral-500">{valueCaption}</p>
        )}
      </div>
      <StatusTag status={status} />
    </div>
  );

  if (to) {
    return (
      <Link href={to} className="block">
        {body}
      </Link>
    );
  }
  return body;
}
