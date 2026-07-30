"use client";

import { AlertTriangle, CheckCircle2, Clock, Wallet } from "lucide-react";
import { KpiCard, StaggerGrid, StaggerItem } from "@/components/ui/kpi-card";
import { TransactionRow } from "@/components/ui/transaction-row";
import { OverdueTrendChart } from "@/components/charts/overdue-trend-chart";
import { GaugeChart } from "@/components/charts/gauge-chart";
import { DashboardTopbar } from "@/components/dashboard/dashboard-shell";
import type { Decision, Invoice } from "@/lib/types";
import { usd } from "@/lib/format";

// ponytail: no real analytics pipeline behind this chart — static demo series,
// add a real trend/efficiency source when one exists.
const overdueTrend = [
  { month: "Jan", current: 148000, prior: 162000 },
  { month: "Feb", current: 141000, prior: 158000 },
  { month: "Mar", current: 133000, prior: 155000 },
  { month: "Apr", current: 120000, prior: 149000 },
  { month: "May", current: 108000, prior: 151000 },
  { month: "Jun", current: 96000, prior: 144000 },
  { month: "Jul", current: 84000, prior: 139000 },
];
const collectionEfficiency = 0.812;

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

  const totalOverdue = invoices.reduce((sum, i) => sum + i.amountDue, 0);
  const pendingApprovals = decisions.filter(
    (d) => d.status === "pending_approval",
  ).length;
  const autoExecuted = decisions.filter(
    (d) => d.status === "auto_executed",
  ).length;
  const openEscalations = decisions.filter(
    (d) => d.status === "ask_human",
  ).length;

  const recent = [...decisions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, compact ? 3 : 5);

  return (
    <div className="space-y-8">
      {!compact && <DashboardTopbar title="dashboard" />}

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
            trend={{ direction: "down", text: "12% vs last month" }}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label="Pending approvals"
            value={pendingApprovals}
            icon={<Clock size={20} strokeWidth={2} />}
            caption="Gated actions awaiting a human"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label="Auto-executed today"
            value={autoExecuted}
            icon={<CheckCircle2 size={20} strokeWidth={2} />}
            caption="Executed on pre-approved policy"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label="Open escalations"
            value={openEscalations}
            icon={<AlertTriangle size={20} strokeWidth={2} />}
            trend={{ direction: "up", text: "Needs input", good: false }}
          />
        </StaggerItem>
      </StaggerGrid>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-neutral-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-h3 text-neutral-900">Overdue trend</h2>
            <div className="flex items-center gap-4 text-caption text-neutral-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-0.5 w-5 bg-primary-500" /> This period
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-0.5 w-5 border-t-2 border-dashed border-neutral-300" />
                Prior period
              </span>
            </div>
          </div>
          <div className="mt-6">
            <OverdueTrendChart data={overdueTrend} />
          </div>
        </div>
        <div className="rounded-lg border border-neutral-100 bg-white p-6 shadow-sm">
          <h2 className="text-h3 text-neutral-900">Collection efficiency</h2>
          <div className="mt-8">
            <GaugeChart value={collectionEfficiency} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-100 bg-white p-6 shadow-sm">
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
