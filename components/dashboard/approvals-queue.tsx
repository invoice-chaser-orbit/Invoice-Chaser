"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { DashboardTopbar } from "@/components/dashboard/dashboard-shell";
import { IcButton } from "@/components/ui/ic-button";
import { StatusTag } from "@/components/ui/status-tag";
import { ConfidenceMeter } from "@/components/ui/progress-bar";
import { PageTransition } from "@/components/ui/motion-primitives";
import { StaggerGrid, StaggerItem } from "@/components/ui/kpi-card";
import { HumanActionDialog } from "@/components/dashboard/human-action-dialog";
import { formatDateTime, usd } from "@/lib/format";
import type { Decision, Invoice, TrailStep } from "@/lib/types";
import type { HumanActionType } from "@/lib/executor";
import { humanizeToolName } from "@/lib/toolLabels";
import { submitHumanAction } from "@/app/(dashboard)/approvals/actions";
import { cn } from "@/lib/utils";

const actions: { label: string; type: HumanActionType }[] = [
  { label: "Approve", type: "approve" },
  { label: "Edit", type: "edit" },
  { label: "Redirect", type: "redirect" },
  { label: "Override", type: "override" },
];

export function ApprovalsQueue({
  decisions,
  invoices,
  trailsByDecisionId = {},
}: {
  decisions: Decision[];
  invoices: Invoice[];
  trailsByDecisionId?: Record<string, TrailStep[]>;
}) {
  const [dialog, setDialog] = useState<{
    decision: Decision;
    actionType: Exclude<HumanActionType, "approve">;
  } | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const getInvoice = (invoiceId: string) => invoices.find((i) => i.id === invoiceId);

  const queue = [...decisions]
    .filter((d) => d.status === "pending_approval" || d.status === "ask_human")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  function runAction(decisionId: string, actionType: HumanActionType, fields?: {
    editedAction?: string;
    editedReasoning?: string;
    humanNote?: string;
  }) {
    setPendingId(decisionId);
    startTransition(async () => {
      try {
        await submitHumanAction(decisionId, { actionType, ...fields });
        setDialog(null);
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <PageTransition className="space-y-8">
      <DashboardTopbar title="approvals" notificationCount={queue.length} />

      <div>
        <h1 className="text-h2 text-neutral-900">Approval queue</h1>
        <p className="mt-1 text-body text-neutral-500">
          Only gated decisions appear here. Nothing in this queue has been sent.
        </p>
      </div>

      <StaggerGrid className="grid gap-6">
        {queue.map((d) => {
          const invoice = getInvoice(d.invoiceId);
          const busy = isPending && pendingId === d.id;
          return (
            <StaggerItem key={d.id}>
              <article
                className={cn(
                  "glass rounded-lg p-6 shadow-sm",
                  d.status === "ask_human" ? "glass-warning" : "glass-white",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-h3 text-neutral-900">
                      {invoice?.customerName ?? d.customerId}
                    </h2>
                    <p className="mt-1 text-caption text-neutral-500">
                      {d.invoiceId} ·{" "}
                      {invoice ? usd(invoice.amountDue, invoice.currency) : "—"} ·{" "}
                      {formatDateTime(d.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <ConfidenceMeter value={d.confidence} />
                    <StatusTag status={d.status} />
                  </div>
                </div>

                <p className="mt-5 text-body font-semibold text-neutral-900">
                  {d.action}
                </p>
                <p className="mt-2 line-clamp-3 text-body text-neutral-500">
                  {d.reasoning}
                </p>
                {trailsByDecisionId[d.id] && trailsByDecisionId[d.id].length > 0 && (
                  <ol className="mt-4 space-y-1.5">
                    {[...trailsByDecisionId[d.id]]
                      .sort((a, b) => a.stepIndex - b.stepIndex)
                      .map((step) => (
                        <li
                          key={step.stepIndex}
                          className="flex items-center gap-2 text-caption text-neutral-600"
                        >
                          <span
                            className={
                              step.success
                                ? "h-1.5 w-1.5 rounded-full bg-success-text"
                                : "h-1.5 w-1.5 rounded-full bg-danger-text"
                            }
                          />
                          {step.stepIndex}. {humanizeToolName(step.toolName)}
                        </li>
                      ))}
                  </ol>
                )}

                <Link
                  href={`/decisions/${d.id}`}
                  className="mt-2 inline-block text-caption text-primary-600 hover:underline"
                >
                  Read full decision detail
                </Link>

                {d.escalationReason && (
                  <p className="mt-4 rounded-sm border border-danger-border bg-danger-bg p-3 text-caption text-danger-text">
                    {d.escalationReason}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  {actions.map((a, i) => (
                    <IcButton
                      key={a.label}
                      size="sm"
                      variant={i === 0 ? "primary" : i === 3 ? "ghost" : "outlined"}
                      disabled={busy}
                      onClick={() => {
                        if (a.type === "approve") {
                          runAction(d.id, "approve");
                        } else {
                          setDialog({ decision: d, actionType: a.type });
                        }
                      }}
                    >
                      {busy && a.type === "approve" ? "Approving…" : a.label}
                    </IcButton>
                  ))}
                </div>
              </article>
            </StaggerItem>
          );
        })}
      </StaggerGrid>

      {dialog && (
        <HumanActionDialog
          open
          onOpenChange={(open) => !open && setDialog(null)}
          actionType={dialog.actionType}
          decision={dialog.decision}
          submitting={isPending}
          onSubmit={(fields) => runAction(dialog.decision.id, dialog.actionType, fields)}
        />
      )}
    </PageTransition>
  );
}
