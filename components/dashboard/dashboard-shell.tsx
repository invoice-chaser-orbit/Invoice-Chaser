"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Inbox, LayoutDashboard, ListChecks } from "lucide-react";
import { AvatarCircle } from "@/components/ui/avatar-circle";
import { NotificationBell } from "@/components/ui/notification-bell";
import { DashboardSearch } from "@/components/dashboard/dashboard-search";
import { RunAgentButton } from "@/components/dashboard/run-agent-panel";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/decisions", label: "Decisions", icon: ListChecks },
  { href: "/approvals", label: "Approvals", icon: Inbox },
  { href: "/executed", label: "Executed", icon: CheckCircle2 },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass glass-white fixed top-4 bottom-4 left-4 z-30 flex w-20 flex-col items-center rounded-[8px] py-6 shadow-lg">
      <Link
        href="/"
        aria-label="InvoiceChaser home"
        className="grid h-11 w-11 place-items-center rounded-md bg-primary-500"
      >
        <span className="grid grid-cols-2 gap-0.5">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-white" />
          ))}
        </span>
      </Link>
      <nav className="mt-10 flex flex-col items-center gap-3">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              className={cn(
                "grid h-11 w-11 place-items-center rounded-md transition-colors",
                active ? "bg-primary-50 text-primary-500" : "text-neutral-500 hover:bg-white/60",
              )}
            >
              <item.icon size={20} strokeWidth={2} />
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col items-center gap-3 border-t border-neutral-200/60 pt-4">
        <RunAgentButton />
      </div>
    </aside>
  );
}

export function DashboardTopbar({
  notificationCount = 0,
  onSearchChange,
}: {
  title: string;
  notificationCount?: number;
  onSearchChange?: (query: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <DashboardSearch onLocalSearchChange={onSearchChange} />
      <div className="flex items-center gap-3">
        <NotificationBell count={notificationCount} />
        {/* <div className="flex items-center gap-3">
          <AvatarCircle name="Holland Reyes" size={44} />
          <div className="hidden sm:block">
            <p className="text-body font-semibold text-neutral-900">Holland</p>
            <p className="text-caption text-neutral-500">AR Manager</p>
          </div>
        </div> */}
      </div>
    </div>
  );
}
