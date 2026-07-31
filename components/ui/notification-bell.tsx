"use client";

import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationBell({ count = 0, className }: { count?: number; className?: string }) {
  return (
    <button
      type="button"
      aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
      className={cn(
        "relative inline-flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 bg-white transition-colors hover:bg-neutral-50",
        className,
      )}
    >
      <Bell size={20} strokeWidth={2} className="text-neutral-500" />
      {count > 0 && <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500" />}
    </button>
  );
}
