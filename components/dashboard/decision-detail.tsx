"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/dashboard-shell";
import { StatusTag, Tag } from "@/components/ui/status-tag";
import { ConfidenceMeter } from "@/components/ui/progress-bar";
import { PageTransition } from "@/components/ui/motion-primitives";
import type { CustomerHistory, Decision, Invoice } from "@/lib/types";
import { formatDateTime, usd } from "@/lib/format";
import { cn } from "@/lib/utils";

const TABS = ["Overview", "Audit trail", "Teach-me"] as const;

function parseEscalation(reason: string) {
  const labels = [
    "Tried",
    "Found",
    "Could not resolve",
    "Options",
    "Recommendation",
  ];
  const keys = ["Tried:", "Found:", "Could not resolve:", "Options:", "Recommendation:"];
  const sections: { label: string; text: string }[] = [];
  const positions = keys
    .map((k, i) => ({ i, at: reason.indexOf(k), k }))
    .filter((p) => p.at >= 0)
    .sort((a, b) => a.at - b.at);

  if (positions.length === 0) {
    return [{ label: "Escalation reason", text: reason }];
  }

  positions.forEach((p, idx) => {
    const start = p.at + p.k.length;
    const end =
      idx + 1 < positions.length ? positions[idx + 1].at : reason.length;
    sections.push({
      label: labels[p.i],
      text: reason.slice(start, end).trim().replace(/[.,]$/, ""),
    });
  });
  return sections;
}

function OverviewTab({ decision }: { decision: Decision }) {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-neutral-100 bg-white p-6 shadow-sm">
        <p className="text-caption text-neutral-500 uppercase">Goal</p>
        <p className="mt-2 text-body text-neutral-700">{decision.goal}</p>
      </section>
      <section className="rounded-lg border border-neutral-100 bg-white p-6 shadow-sm">
        <p className="text-caption text-neutral-500 uppercase">Action</p>
        <p className="mt-2 text-body font-semibold text-neutral-900">
          {decision.action}
        </p>
      </section>
      <section className="rounded-lg border border-neutral-100 bg-white p-6 shadow-sm">
        <p className="text-caption text-neutral-500 uppercase">Reasoning</p>
        <p className="mt-2 text-body text-neutral-700">{decision.reasoning}</p>
      </section>

      {decision.status === "ask_human" && decision.escalationReason && (
        <section className="rounded-lg border border-danger-border bg-white p-6 shadow-sm">
          <Tag tone="danger">Escalation</Tag>
          <dl className="mt-5 space-y-4">
            {parseEscalation(decision.escalationReason).map((s) => (
              <div key={s.label}>
                <dt className="text-caption text-neutral-500 uppercase">
                  {s.label}
                </dt>
                <dd className="mt-1 text-body text-neutral-700">{s.text}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {decision.status !== "ask_human" && (
        <section className="rounded-lg border border-neutral-100 bg-white p-6 shadow-sm">
          <p className="text-caption text-neutral-500 uppercase">
            Escalation reason
          </p>
          <p className="mt-2 text-body text-neutral-500">
            None — this decision did not require escalation.
          </p>
        </section>
      )}
    </div>
  );
}

function TrailTab({ decision }: { decision: Decision }) {
  const steps = [...decision.trail].sort((a, b) => a.stepIndex - b.stepIndex);
  return (
    <ol className="space-y-4">
      {steps.map((step) => (
        <li
          key={step.stepIndex}
          className={cn(
            "rounded-lg border border-neutral-100 border-l-4 bg-white p-6 shadow-sm",
            step.success ? "border-l-primary-500" : "border-l-danger-text",
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-sm bg-neutral-100 text-caption text-neutral-700">
                {step.stepIndex + 1}
              </span>
              <span className="font-mono text-body font-semibold text-neutral-900">
                {step.toolName}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-caption text-neutral-500">
                {formatDateTime(step.timestamp)}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-caption",
                  step.success
                    ? "bg-success-bg text-success-text"
                    : "bg-danger-bg text-danger-text",
                )}
              >
                {step.success ? <Check size={14} /> : <X size={14} />}
                {step.success ? "success" : "failed"}
              </span>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-caption text-neutral-500 uppercase">input</p>
              <pre className="mt-1 overflow-x-auto rounded-sm bg-neutral-50 p-3 font-mono text-[12px] leading-5 text-neutral-700">
                {JSON.stringify(step.input, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-caption text-neutral-500 uppercase">output</p>
              <pre className="mt-1 overflow-x-auto rounded-sm bg-neutral-50 p-3 font-mono text-[12px] leading-5 text-neutral-700">
                {JSON.stringify(step.output, null, 2)}
              </pre>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function TeachMeTab({ decision }: { decision: Decision }) {
  return (
    <section className="rounded-lg border border-primary-200 bg-white p-6 shadow-sm">
      <Tag tone="info">manualProcedure</Tag>
      <h2 className="mt-4 text-h3 text-neutral-900">
        How a person would reach this decision without the agent
      </h2>
      <ol className="mt-6 space-y-5">
        {decision.manualProcedure.map((stepText, i) => (
          <li key={i} className="flex gap-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-50 text-caption font-semibold text-primary-600">
              {i + 1}
            </span>
            <p className="text-body-lg text-neutral-700">{stepText}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function DecisionDetail({
  decision,
  invoice,
  customer,
}: {
  decision: Decision;
  invoice: Invoice | undefined;
  customer: CustomerHistory | undefined;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

  return (
    <PageTransition className="space-y-8">
      <DashboardTopbar title="decision detail" />

      <Link
        href="/decisions"
        className="inline-flex items-center gap-2 text-caption text-neutral-500 transition-colors hover:text-primary-500"
      >
        <ArrowLeft size={16} strokeWidth={2} />
        Back to decisions
      </Link>

      <header className="rounded-lg border border-neutral-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-h2 text-neutral-900">
              {invoice?.customerName ?? customer?.customerName ?? decision.customerId}
            </h1>
            <p className="mt-1 text-caption text-neutral-500">
              {decision.id} · {decision.invoiceId} ·{" "}
              {invoice ? usd(invoice.amountDue, invoice.currency) : "—"} ·{" "}
              {formatDateTime(decision.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-caption text-neutral-500 uppercase">
                Confidence
              </p>
              <ConfidenceMeter value={decision.confidence} className="mt-1" />
            </div>
            <StatusTag status={decision.status} />
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-caption transition-colors",
              tab === t
                ? "border-primary-100 bg-primary-50 text-primary-600"
                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && <OverviewTab decision={decision} />}
      {tab === "Audit trail" && <TrailTab decision={decision} />}
      {tab === "Teach-me" && <TeachMeTab decision={decision} />}
    </PageTransition>
  );
}
