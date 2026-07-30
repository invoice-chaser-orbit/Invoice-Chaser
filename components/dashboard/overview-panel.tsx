"use client";

import { AlertTriangle, Banknote, CalendarClock, CheckCircle2, Clock, Wallet } from "lucide-react";
import { KpiCard, StaggerGrid, StaggerItem } from "@/components/ui/kpi-card";
import { TransactionRow } from "@/components/ui/transaction-row";
import { OverdueTrendChart } from "@/components/charts/overdue-trend-chart";
import { GaugeChart } from "@/components/charts/gauge-chart";
import { DashboardTopbar } from "@/components/dashboard/dashboard-shell";
import type { Decision, Invoice } from "@/lib/types";
import { usd } from "@/lib/format";

// Groups invoices by issue month and sums real outstanding balance per month — the last 7
// months with data, oldest first. Replaces a static demo series.
function computeOverdueTrend(invoices: Invoice[]): { month: string; current: number }[] {
  const byMonth = new Map<string, number>();
  for (const inv of invoices) {
    const outstanding = inv.amountDue - (inv.amountReceived ?? 0);
    if (outstanding <= 0) continue;
    const key = inv.issueDate.slice(0, 7); // "YYYY-MM"
    byMonth.set(key, (byMonth.get(key) ?? 0) + outstanding);
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([key, current]) => ({
      month: new Date(`${key}-01`).toLocaleDateString("en-US", { month: "short" }),
      current,
    }));
}

// Amount-weighted average age (days) of invoices still carrying an outstanding balance — DSO
// computed from real invoice data, not the demo series above.
function computeDso(invoices: Invoice[]): number {
  const today = Date.now();
  let weightedDays = 0;
  let totalOutstanding = 0;
  for (const inv of invoices) {
    const outstanding = inv.amountDue - (inv.amountReceived ?? 0);
    if (outstanding <= 0) continue;
    const ageDays = Math.max(0, Math.floor((today - new Date(inv.issueDate).getTime()) / 86400000));
    weightedDays += ageDays * outstanding;
    totalOutstanding += outstanding;
  }
  return totalOutstanding > 0 ? Math.round(weightedDays / totalOutstanding) : 0;
}

export function OverviewPanel({
  invoices,
  decisions,
  compact = false,
}: {
  invoices: Invoice[];
  decisions: Decision[];
  compact?: boolean;
}) {
  const getInvoice = (invoiceId: string) => invoices.find((i) => i.id === invoiceId);
  const currency = invoices[0]?.currency ?? "LKR";

  const totalOverdue = invoices.reduce(
    (sum, i) => sum + Math.max(0, i.amountDue - (i.amountReceived ?? 0)),
    0,
  );
  const pendingApprovals = decisions.filter(
    (d) => d.status === "pending_approval",
  ).length;
  const today = new Date().toDateString();
  const autoExecuted = decisions.filter(
    (d) => d.status === "auto_executed" && new Date(d.createdAt).toDateString() === today,
  ).length;
  const openEscalations = decisions.filter(
    (d) => d.status === "ask_human",
  ).length;
  const dso = computeDso(invoices);
  const amountRecovered = invoices.reduce((sum, i) => sum + (i.amountReceived ?? 0), 0);
  const totalBilled = invoices.reduce((sum, i) => sum + i.amountDue, 0);
  const collectionEfficiency = totalBilled > 0 ? amountRecovered / totalBilled : 0;
  const overdueTrend = computeOverdueTrend(invoices);
  const notificationCount = pendingApprovals + openEscalations;

  const recent = [...decisions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, compact ? 3 : 5);

  return (
    <div className="space-y-8">
      {!compact && <DashboardTopbar title="dashboard" notificationCount={notificationCount} />}

      <div>
        <h1 className="text-h2 text-neutral-900">Dashboard</h1>
        <p className="mt-1 text-body text-neutral-500">
          Minimise overdue receivables without damaging customer relationships.
        </p>
      </div>

      <StaggerGrid className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <KpiCard
            label="Total overdue"
            value={totalOverdue}
            format={(n) => usd(n, currency)}
            icon={<Wallet size={20} strokeWidth={2} />}
            caption="Outstanding balance across the ledger"
            tone="primary"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label="Pending approvals"
            value={pendingApprovals}
            icon={<Clock size={20} strokeWidth={2} />}
            caption="Gated actions awaiting a human"
            tone="warning"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label="Auto-executed today"
            value={autoExecuted}
            icon={<CheckCircle2 size={20} strokeWidth={2} />}
            caption="Executed on pre-approved policy"
            tone="success"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label="Open escalations"
            value={openEscalations}
            icon={<AlertTriangle size={20} strokeWidth={2} />}
            trend={{ direction: "up", text: "Needs input", good: false }}
            tone="danger"
          />
        </StaggerItem>
      </StaggerGrid>

      <div>
        <h2 className="text-h3 text-neutral-900">Cash-flow summary</h2>
        <StaggerGrid className="mt-4 grid gap-6 sm:grid-cols-2">
          <StaggerItem>
            <KpiCard
              label="Days sales outstanding"
              value={dso}
              format={(n) => `${n} days`}
              icon={<CalendarClock size={20} strokeWidth={2} />}
              caption="Amount-weighted age of unpaid balances"
              tone="info"
            />
          </StaggerItem>
          <StaggerItem>
            <KpiCard
              label="Recovered this cycle"
              value={amountRecovered}
              format={(n) => usd(n, currency)}
              icon={<Banknote size={20} strokeWidth={2} />}
              caption="Sum of amountReceived across the ledger"
              tone="success"
            />
          </StaggerItem>
        </StaggerGrid>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass glass-white rounded-lg p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-h3 text-neutral-900">Overdue trend</h2>
            <div className="flex items-center gap-4 text-caption text-neutral-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-0.5 w-5 bg-primary-500" /> Outstanding balance
              </span>
            </div>
          </div>
          <div className="mt-6">
            <OverdueTrendChart data={overdueTrend} />
          </div>
        </div>
        <div className="glass glass-white rounded-lg p-6 shadow-sm">
          <h2 className="text-h3 text-neutral-900">Collection efficiency</h2>
          <div className="mt-8">
            <GaugeChart value={collectionEfficiency} />
          </div>
        </div>
      </div>

      <div className="glass glass-white rounded-lg p-6 shadow-sm">
        <h2 className="text-h3 text-neutral-900">Recent decisions</h2>
        <div className="mt-4 divide-y divide-neutral-100">
          {recent.map((d) => {
            const invoice = getInvoice(d.invoiceId);
            return (
              <TransactionRow
                key={d.id}
                to={compact ? undefined : `/decisions/${d.id}`}
                title={invoice?.customerName ?? d.customerId}
                subtitle={d.action}
                value={invoice ? usd(invoice.amountDue, invoice.currency) : "—"}
                valueCaption={d.invoiceId}
                status={d.status}
                confidence={d.confidence}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
