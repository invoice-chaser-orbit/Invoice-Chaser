"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardTopbar } from "@/components/dashboard/dashboard-shell";
import { DataCell, DataRow, DataTable } from "@/components/ui/data-table";
import { StatusTag, Tag } from "@/components/ui/status-tag";
import { ConfidenceMeter } from "@/components/ui/progress-bar";
import { Pagination } from "@/components/ui/pagination-nav";
import { PageTransition } from "@/components/ui/motion-primitives";
import type { Decision, Invoice } from "@/lib/types";
import { formatDateTime, usd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { isIncompleteDecision } from "@/lib/decision-state";
import { displayDecisionAction } from "@/lib/decision-copy";
import { latestDecisionsByInvoice } from "@/lib/decision-history";

type DecisionFilter = "all" | "pending_approval" | "ask_human" | "incomplete";
const filters: { key: DecisionFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending_approval", label: "Pending approval" },
  { key: "ask_human", label: "Needs input" },
  { key: "incomplete", label: "Incomplete runs" },
];

const PAGE_SIZE = 5;

export function DecisionsList({
  decisions,
  invoices,
}: {
  decisions: Decision[];
  invoices: Invoice[];
}) {
  const [filter, setFilter] = useState<DecisionFilter>("all");
  const [page, setPage] = useState(1);
  const router = useRouter();
  const getInvoice = (invoiceId: string) => invoices.find((i) => i.id === invoiceId);

  const rows = useMemo(() => {
    return latestDecisionsByInvoice(decisions)
      .filter(
        (d) =>
          filter === "all" ||
          (filter === "incomplete"
            ? isIncompleteDecision(d)
            : !isIncompleteDecision(d) && d.status === filter),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [decisions, filter]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const notificationCount = latestDecisionsByInvoice(decisions).filter(
    (d) =>
      !isIncompleteDecision(d) && (d.status === "pending_approval" || d.status === "ask_human"),
  ).length;

  return (
    <PageTransition className="space-y-8">
      <DashboardTopbar title="decisions" notificationCount={notificationCount} />

      <div>
        <h1 className="text-h2 text-neutral-900">Decisions</h1>
        <p className="mt-1 text-body text-neutral-500">
          One row per invoice, showing its most recent agent review.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => {
              setFilter(f.key);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-4 py-1.5 text-caption transition-colors",
              filter === f.key
                ? "border-primary-100 bg-primary-50 text-primary-600"
                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <DataTable
        headers={["Customer", "Action", "Amount", "Confidence", "Created", "Status"]}
        columnWidths={["18%", "20%", "12%", "13%", "20%", "17%"]}
        className="min-h-[608px]"
        tableClassName="min-w-[1200px] table-fixed"
      >
        {current.map((d) => {
          const invoice = getInvoice(d.invoiceId);
          return (
            <DataRow
              key={d.id}
              className="h-28 cursor-pointer"
              onClick={() => router.push(`/decisions/${d.id}`)}
            >
              <DataCell className="font-semibold text-neutral-900">
                {invoice?.customerName ?? d.customerId}
                <span className="block text-caption font-normal text-neutral-500">
                  {d.invoiceId}
                </span>
              </DataCell>
              <DataCell className="max-w-sm">
                <span className="line-clamp-2">
                  {d.action
                    ? displayDecisionAction(d.action)
                    : "Run ended before an action was produced"}
                </span>
                {d.escalationReason && (
                  <span className="mt-1 block text-caption text-danger-text">
                    Escalated — see detail
                  </span>
                )}
              </DataCell>
              <DataCell className="tabular-nums">
                {invoice ? usd(invoice.amountDue, invoice.currency) : "—"}
              </DataCell>
              <DataCell>
                <ConfidenceMeter value={isIncompleteDecision(d) ? 0 : d.confidence} />
              </DataCell>
              <DataCell className="whitespace-nowrap">{formatDateTime(d.createdAt)}</DataCell>
              <DataCell>
                {isIncompleteDecision(d) ? (
                  <Tag tone="neutral">Incomplete run</Tag>
                ) : (
                  <StatusTag status={d.status} />
                )}
              </DataCell>
            </DataRow>
          );
        })}
      </DataTable>

      <div className="flex justify-end">
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
      </div>
    </PageTransition>
  );
}
