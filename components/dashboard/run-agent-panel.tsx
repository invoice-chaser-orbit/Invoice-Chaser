"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { StatusTag } from "@/components/ui/status-tag";
import { ConfidenceMeter, ProgressBar } from "@/components/ui/progress-bar";
import { humanizeToolName } from "@/lib/toolLabels";
import { formatDateTime, usd } from "@/lib/format";
import { seedInvoices } from "@/data/seed";
import { cn } from "@/lib/utils";
import type { Decision, Invoice } from "@/lib/types";

type ScanItem = { decision: Decision; invoice: Invoice };

const TOTAL_INVOICES = seedInvoices.length;

export function RunAgentButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [items, setItems] = useState<ScanItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // The fetch keeps running server-side regardless of whether the sheet is open — closing it
  // just hides the panel, it doesn't cancel the scan (autonomous actions keep going; the human
  // can inspect after, per the human-in-the-loop split).
  async function runScan() {
    setOpen(true);
    setRunning(true);
    setItems([]);
    setError(null);

    try {
      const res = await fetch("/api/agent/run", { method: "POST" });
      if (!res.ok || !res.body) throw new Error(`Agent run failed (${res.status})`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const raw of lines) {
          if (!raw.trim()) continue;
          const payload = JSON.parse(raw) as
            ScanItem | { done: true; total: number } | { error: string };

          if ("error" in payload) {
            setError(payload.error);
          } else if ("decision" in payload) {
            setItems((prev) => [...prev, payload]);
          }
        }
      }

      toast.success("Agent run complete", {
        description: `${TOTAL_INVOICES} invoice(s) scanned.`,
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Agent run failed");
    } finally {
      setRunning(false);
    }
  }

  // While a run is in flight, clicking the trigger just reopens the panel on the run already
  // underway instead of starting a second, overlapping scan.
  function handleTriggerClick() {
    if (running) setOpen(true);
    else runScan();
  }

  return (
    <>
      <button
        type="button"
        onClick={handleTriggerClick}
        aria-label="Run agent"
        title="Run agent"
        className={cn(
          "grid h-11 w-11 place-items-center rounded-md transition-colors",
          running ? "bg-primary-50 text-primary-500" : "text-neutral-500 hover:bg-white/60",
        )}
      >
        {running ? (
          <Loader2 size={20} strokeWidth={2} className="animate-spin" />
        ) : (
          <PlayCircle size={20} strokeWidth={2} />
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Agent run — daily ledger scan</SheetTitle>
            <SheetDescription>
              {running
                ? "Investigating each seeded invoice via the reasoning loop..."
                : error
                  ? "The run stopped early."
                  : "Run complete."}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-2">
            <ProgressBar value={items.length / TOTAL_INVOICES} />
            <p className="text-caption text-neutral-500">
              {items.length} / {TOTAL_INVOICES} invoice(s) decided
            </p>
          </div>

          {error && (
            <p className="mt-4 rounded-sm border border-danger-border bg-danger-bg p-3 text-caption text-danger-text">
              {error}
            </p>
          )}

          <ol className="mt-6 space-y-4">
            {items.map(({ decision, invoice }) => (
              <li key={decision.id} className="glass glass-white rounded-lg p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-body font-semibold text-neutral-900">
                      {invoice.customerName}
                    </p>
                    <p className="text-caption text-neutral-500">
                      {invoice.id} · {usd(invoice.amountDue, invoice.currency)} ·{" "}
                      {formatDateTime(decision.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ConfidenceMeter value={decision.confidence} />
                    <StatusTag status={decision.status} />
                  </div>
                </div>
                <p className="mt-3 text-body text-neutral-900">{decision.action}</p>
                {decision.trail.length > 0 && (
                  <ol className="mt-3 space-y-1">
                    {decision.trail.map((step) => (
                      <li
                        key={step.stepIndex}
                        className="flex items-center gap-2 text-caption text-neutral-600"
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            step.success ? "bg-success-text" : "bg-danger-text",
                          )}
                        />
                        {step.stepIndex}. {humanizeToolName(step.toolName)}
                      </li>
                    ))}
                  </ol>
                )}
                <Link
                  href={`/decisions/${decision.id}`}
                  className="mt-3 inline-block text-caption text-primary-600 hover:underline"
                >
                  Read full decision detail
                </Link>
              </li>
            ))}
          </ol>

          {running && items.length < TOTAL_INVOICES && !error && (
            <div className="mt-6 flex items-center gap-2 text-caption text-neutral-500">
              <Loader2 size={14} className="animate-spin" />
              Reasoning about invoice {items.length + 1} of {TOTAL_INVOICES}...
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
