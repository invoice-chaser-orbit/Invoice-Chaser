"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Notice = {
  id: string;
  customer: string;
  invoiceId: string;
  reason: string;
  status: "pending_approval" | "ask_human" | "auto_executed";
};
type Notifications = {
  reviewCount: number;
  incompleteCount: number;
  needsReview: Notice[];
  incomplete: Notice[];
};

export function NotificationBell({ count = 0, className }: { count?: number; className?: string }) {
  const [data, setData] = useState<Notifications | null>(null);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      if (!response.ok) throw new Error("Notifications unavailable");
      setData((await response.json()) as Notifications);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const reviewCount = data?.reviewCount ?? count;
  const incompleteCount = data?.incompleteCount ?? 0;

  return (
    <Popover onOpenChange={(open) => open && void load()}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications: ${reviewCount} need review, ${incompleteCount} incomplete runs`}
          className={cn(
            "relative inline-flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 bg-white transition-colors hover:bg-neutral-50",
            className,
          )}
        >
          <Bell size={20} strokeWidth={2} className="text-neutral-500" />
          {reviewCount > 0 && (
            <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-danger-text px-1 text-[11px] leading-5 text-white">
              {reviewCount > 99 ? "99+" : reviewCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(24rem,calc(100vw-2rem))] p-0">
        <div className="max-h-[70vh] overflow-y-auto p-4">
          <h2 className="text-body font-semibold text-neutral-900">Notifications</h2>
          {error && !data && (
            <p className="mt-3 text-caption text-danger-text">Could not load notifications.</p>
          )}
          {!error && !data && <p className="mt-3 text-caption text-neutral-500">Loading…</p>}
          {data && (
            <>
              <section className="mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-caption font-semibold text-neutral-700">
                    Needs review ({reviewCount})
                  </h3>
                  <Link href="/approvals" className="text-caption text-primary-600 hover:underline">
                    Approval queue
                  </Link>
                </div>
                {data.needsReview.length === 0 ? (
                  <p className="mt-2 text-caption text-neutral-500">Nothing needs review.</p>
                ) : (
                  <ul className="mt-2 divide-y divide-neutral-100">
                    {data.needsReview.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/decisions/${item.id}`}
                          className="block rounded-sm px-2 py-2 hover:bg-neutral-50"
                        >
                          <span className="block text-caption font-semibold text-neutral-900">
                            {item.customer} · {item.invoiceId}
                          </span>
                          <span className="block text-caption text-neutral-500">
                            {item.status === "ask_human" ? "Needs input" : "Pending approval"}
                          </span>
                          <span className="mt-1 line-clamp-2 block text-caption text-neutral-600">
                            {item.reason}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section className="mt-4 border-t border-neutral-100 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-caption font-semibold text-neutral-700">
                    Incomplete runs ({incompleteCount})
                  </h3>
                  <Link href="/decisions" className="text-caption text-primary-600 hover:underline">
                    All decisions
                  </Link>
                </div>
                {data.incomplete.length === 0 ? (
                  <p className="mt-2 text-caption text-neutral-500">No incomplete runs.</p>
                ) : (
                  <ul className="mt-2 divide-y divide-neutral-100">
                    {data.incomplete.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/decisions/${item.id}`}
                          className="block rounded-sm px-2 py-2 hover:bg-neutral-50"
                        >
                          <span className="block text-caption font-semibold text-neutral-900">
                            {item.customer} · {item.invoiceId}
                          </span>
                          <span className="block text-caption text-neutral-500">
                            Run stopped before a recommendation was saved
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
