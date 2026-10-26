"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { DecisionSearchHit } from "@/lib/search-decisions";

export function DashboardSearch({
  onLocalSearchChange,
}: {
  onLocalSearchChange?: (query: string) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [results, setResults] = useState<DecisionSearchHit[]>([]);
  const [count, setCount] = useState(0);
  const localSearch = onLocalSearchChange !== undefined;

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (localSearch) return;
    const trimmed = query.trim();
    if (!trimmed) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Search failed");
        const data = (await response.json()) as { count: number; results: DecisionSearchHit[] };
        setResults(data.results);
        setCount(data.count);
        setError(false);
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, localSearch]);

  const url = `/search?q=${encodeURIComponent(query.trim())}`;
  return (
    <div ref={root} className="relative w-full max-w-sm">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (!query.trim()) return;
          if (localSearch) return;
          setOpen(false);
          router.push(url);
        }}
      >
        <Search
          size={16}
          strokeWidth={2}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setResults([]);
            setCount(0);
            setError(false);
            setOpen(!localSearch);
            onLocalSearchChange?.(event.target.value);
          }}
          onFocus={() => !localSearch && setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
          placeholder={
            localSearch ? "Search approval cards..." : "Search customers, invoices, decisions..."
          }
          aria-label={
            localSearch ? "Search approval cards" : "Search customers, invoices, and decisions"
          }
          aria-expanded={localSearch ? undefined : open}
          aria-controls={localSearch ? undefined : "dashboard-search-results"}
          className="w-full rounded-md border border-neutral-300 bg-white py-2.5 pr-4 pl-10 text-body text-neutral-900 transition-shadow placeholder:text-neutral-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none"
        />
      </form>
      {!localSearch && open && query.trim() && (
        <div
          id="dashboard-search-results"
          className="absolute top-full right-0 left-0 z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-md border border-neutral-200 bg-white p-2 shadow-lg"
        >
          {loading && <p className="p-3 text-caption text-neutral-500">Searching…</p>}
          {error && (
            <p className="p-3 text-caption text-danger-text">Search is unavailable. Try again.</p>
          )}
          {!loading && !error && results.length === 0 && (
            <p className="p-3 text-caption text-neutral-500">No matching decisions.</p>
          )}
          {!loading &&
            !error &&
            results.map((result) => (
              <Link
                key={result.id}
                href={`/decisions/${result.id}`}
                onClick={() => setOpen(false)}
                className="block rounded-sm p-3 hover:bg-neutral-50"
              >
                <span className="block text-caption font-semibold text-neutral-900">
                  {result.customer} · {result.invoiceId}
                </span>
                <span className="block text-caption text-neutral-500">{result.status}</span>
                <span className="mt-1 line-clamp-1 block text-caption text-neutral-600">
                  {result.action}
                </span>
              </Link>
            ))}
          {!loading && !error && count > 0 && (
            <Link
              href={url}
              onClick={() => setOpen(false)}
              className="block border-t border-neutral-100 p-3 text-caption font-semibold text-primary-600 hover:bg-neutral-50"
            >
              View all {count} result{count === 1 ? "" : "s"}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
