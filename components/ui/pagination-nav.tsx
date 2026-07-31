"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageCount,
  onPageChange,
  className,
}: {
  page: number;
  pageCount: number;
  onPageChange: (p: number) => void;
  className?: string;
}) {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  const btn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-sm border border-neutral-200 bg-white px-3 text-caption text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <nav className={cn("flex items-center gap-2", className)} aria-label="Pagination">
      <button
        type="button"
        className={btn}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} strokeWidth={2} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(btn, p === page && "border-primary-100 bg-primary-50 text-primary-600")}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        className={btn}
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight size={16} strokeWidth={2} />
      </button>
    </nav>
  );
}
