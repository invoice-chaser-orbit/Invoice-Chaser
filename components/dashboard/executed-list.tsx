"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardTopbar } from "@/components/dashboard/dashboard-shell";
import { DataCell, DataRow, DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination-nav";
import { PageTransition } from "@/components/ui/motion-primitives";
import { StatusTag } from "@/components/ui/status-tag";
import { isIncompleteDecision } from "@/lib/decision-state";
import { displayDecisionAction } from "@/lib/decision-copy";
import { latestDecisionsByInvoice } from "@/lib/decision-history";
import { formatDateTime, usd } from "@/lib/format";
import type { Decision, Invoice } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;
type ExecutedFilter =
  "all" | "auto_executed" | "human_approved" | "human_edited" | "human_overridden";
const filters: { key: ExecutedFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "auto_executed", label: "Auto-executed" },
  { key: "human_approved", label: "Human-approved" },
  { key: "human_edited", label: "Human-edited" },
  { key: "human_overridden", label: "Human-overridden" },
];

export function ExecutedList({
  decisions,
  invoices,
}: {
  decisions: Decision[];
  invoices: Invoice[];
}) {
  const [filter, setFilter] = useState<ExecutedFilter>("all");
  const [page, setPage] = useState(1);
  const router = useRouter();
  const invoiceById = new Map(invoices.map((invoice) => [invoice.id, invoice]));
  const completed = decisions.filter(
    (decision) =>
      !isIncompleteDecision(decision) &&
      ["auto_executed", "human_approved", "human_edited", "human_overridden"].includes(
        decision.status,
      ),
  );
  const rows = latestDecisionsByInvoice(completed)
    .filter((decision) => filter === "all" || decision.status === filter)
    .sort((a, b) => (b.completedAt ?? b.createdAt).localeCompare(a.completedAt ?? a.createdAt));
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <PageTransition className="space-y-8">
      <DashboardTopbar title="executed" />
      <div>
        <h1 className="text-h2 text-neutral-900">Executed</h1>
        <p className="mt-1 text-body text-neutral-500">
          Latest completed action for each invoice. Open its Delivery tab to verify customer contact.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setFilter(item.key);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-4 py-1.5 text-caption transition-colors",
              filter === item.key
                ? "border-primary-100 bg-primary-50 text-primary-600"
                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <DataTable
        headers={["Customer", "Action", "Amount", "Completed", "Source"]}
        columnWidths={["22%", "30%", "14%", "18%", "16%"]}
        className="min-h-[608px]"
        tableClassName="min-w-[1000px] table-fixed"
      >
        {current.map((decision) => {
          const invoice = invoiceById.get(decision.invoiceId);
          return (
            <DataRow
              key={decision.id}
              className="h-28 cursor-pointer"
              onClick={() => router.push(`/decisions/${decision.id}`)}
            >
              <DataCell className="font-semibold text-neutral-900">
                {invoice?.customerName ?? decision.customerId}
                <span className="block text-caption font-normal text-neutral-500">
                  {decision.invoiceId}
                </span>
              </DataCell>
              <DataCell>
                <span className="line-clamp-2">{displayDecisionAction(decision.action)}</span>
              </DataCell>
              <DataCell className="tabular-nums">
                {invoice ? usd(invoice.amountDue, invoice.currency) : "—"}
              </DataCell>
              <DataCell className="whitespace-nowrap">
                {formatDateTime(decision.completedAt ?? decision.createdAt)}
              </DataCell>
              <DataCell>
                <StatusTag status={decision.status} />
              </DataCell>
            </DataRow>
          );
        })}
      </DataTable>
      {rows.length === 0 && (
        <p className="text-body text-neutral-500">
          {filter === "all" ? "No completed decisions yet." : "No decisions match this filter."}
        </p>
      )}
      <div className="flex justify-end">
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
      </div>
    </PageTransition>
  );
}
