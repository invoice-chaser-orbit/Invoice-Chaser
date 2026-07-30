"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardTopbar } from "@/components/dashboard/dashboard-shell";
import { DataCell, DataRow, DataTable } from "@/components/ui/data-table";
import { StatusTag } from "@/components/ui/status-tag";
import { ConfidenceMeter } from "@/components/ui/progress-bar";
import { Pagination } from "@/components/ui/pagination-nav";
import { PageTransition } from "@/components/ui/motion-primitives";
import type { Decision, DecisionStatus, Invoice } from "@/lib/types";
import { formatDateTime, usd } from "@/lib/format";
import { cn } from "@/lib/utils";

const filters: { key: DecisionStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "auto_executed", label: "Auto-executed" },
  { key: "pending_approval", label: "Pending approval" },
  { key: "ask_human", label: "Needs input" },
];

const PAGE_SIZE = 5;

export function DecisionsList({
  decisions,
  invoices,
}: {
  decisions: Decision[];
  invoices: Invoice[];
}) {
  const [filter, setFilter] = useState<DecisionStatus | "all">("all");
  const [page, setPage] = useState(1);
  const router = useRouter();
  const getInvoice = (invoiceId: string) => invoices.find((i) => i.id === invoiceId);

  const rows = useMemo(() => {
    return decisions
      .filter((d) => filter === "all" || d.status === filter)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [decisions, filter]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <PageTransition className="space-y-8">
      <DashboardTopbar title="decisions" />

      <div>
        <h1 className="text-h2 text-neutral-900">Decisions</h1>
        <p className="mt-1 text-body text-neutral-500">
          Sorted by most recent. Every row carries its confidence and status.
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
        headers={[
          "Customer",
          "Action",
          "Amount",
          "Confidence",
          "Created",
          "Status",
        ]}
      >
        {current.map((d) => {
          const invoice = getInvoice(d.invoiceId);
          return (
            <DataRow
              key={d.id}
              className="cursor-pointer"
              onClick={() => router.push(`/decisions/${d.id}`)}
            >
              <DataCell className="font-semibold text-neutral-900">
                {invoice?.customerName ?? d.customerId}
                <span className="block text-caption font-normal text-neutral-500">
                  {d.invoiceId}
                </span>
              </DataCell>
              <DataCell className="max-w-sm">
                <span className="line-clamp-2">{d.action}</span>
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
                <ConfidenceMeter value={d.confidence} />
              </DataCell>
              <DataCell className="whitespace-nowrap">
                {formatDateTime(d.createdAt)}
              </DataCell>
              <DataCell>
                <StatusTag status={d.status} />
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
