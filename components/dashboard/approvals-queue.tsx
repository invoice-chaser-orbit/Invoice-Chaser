"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
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
import { isIncompleteDecision } from "@/lib/decision-state";
import { displayDecisionAction } from "@/lib/decision-copy";
import { searchDecisions } from "@/lib/search-decisions";

const actions: { label: string; type: "approve" | "edit" | "override" }[] = [
  { label: "Approve", type: "approve" },
  { label: "Edit", type: "edit" },
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
    actionType: "approve" | "edit" | "override";
  } | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const getInvoice = (invoiceId: string) => invoices.find((i) => i.id === invoiceId);

  const queue = [...decisions]
    .filter(
      (d) =>
        !isIncompleteDecision(d) && (d.status === "pending_approval" || d.status === "ask_human"),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const matchingIds = searchQuery.trim()
    ? new Set(searchDecisions(queue, invoices, searchQuery).map((result) => result.id))
    : null;
  const visibleQueue = matchingIds
    ? queue.filter((decision) => matchingIds.has(decision.id))
    : queue;

  function runAction(
    decisionId: string,
    actionType: HumanActionType,
    fields?: {
      editedAction?: string;
      editedReasoning?: string;
      humanNote?: string;
    },
  ) {
    setPendingId(decisionId);
    startTransition(async () => {
      try {
        const result = await submitHumanAction(decisionId, { actionType, ...fields });
        if (result.queuedForApproval) {
          toast.success("Moved to Pending approval", {
            description: "Review the customer email there before sending it.",
          });
        } else if (result.emailSent) {
          const decision = decisions.find((d) => d.id === decisionId);
          const invoice = decision && getInvoice(decision.invoiceId);
          toast.success("Email sent", {
            description: invoice
              ? `${invoice.customerName} was notified about ${decision.invoiceId}.`
              : "The customer was notified.",
          });
        } else {
          toast.success(actionType === "override" ? "Decision overridden" : "Decision recorded");
        }
        setDialog(null);
        router.refresh();
      } catch (error) {
        toast.error("Action failed", {
          description: error instanceof Error ? error.message : "Please try again.",
        });
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <PageTransition className="space-y-8">
      <DashboardTopbar
        title="approvals"
        notificationCount={queue.length}
        onSearchChange={setSearchQuery}
      />

      <div>
        <h1 className="text-h2 text-neutral-900">Approval queue</h1>
        <p className="mt-1 text-body text-neutral-500">
          Only gated decisions appear here. Nothing in this queue has been sent.
        </p>
        {searchQuery.trim() && (
          <p className="mt-2 text-caption text-neutral-500" aria-live="polite">
            {visibleQueue.length} matching approval{visibleQueue.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <StaggerGrid className="grid gap-6">
        {visibleQueue.length === 0 && searchQuery.trim() && (
          <p className="glass glass-white rounded-lg p-6 text-body text-neutral-500">
            No approval cards match your search.
          </p>
        )}
        {visibleQueue.map((d) => {
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
                      {d.invoiceId} · {invoice ? usd(invoice.amountDue, invoice.currency) : "—"} ·{" "}
                      {formatDateTime(d.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <ConfidenceMeter value={d.confidence} />
                    <StatusTag status={d.status} />
                  </div>
                </div>

                <p className="mt-5 text-body font-semibold text-neutral-900">
                  {displayDecisionAction(d.action)}
                </p>
                <p className="mt-2 line-clamp-3 text-body text-neutral-500">{d.reasoning}</p>
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
                      variant={i === 0 ? "primary" : a.type === "override" ? "ghost" : "outlined"}
                      disabled={busy}
                      onClick={() => {
                        setDialog({ decision: d, actionType: a.type });
                      }}
                    >
                      {a.label}
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
          invoice={getInvoice(dialog.decision.invoiceId)}
          proposedMessage={(() => {
            const step = [...(trailsByDecisionId[dialog.decision.id] ?? [])]
              .reverse()
              .find(
                (item) =>
                  item.toolName === "human_prepared_email" ||
                  item.toolName === "request_reminder_approval",
              );
            const output = step?.output;
            return output &&
              typeof output === "object" &&
              "proposedMessage" in output &&
              typeof output.proposedMessage === "string"
              ? output.proposedMessage
              : undefined;
          })()}
          submitting={isPending}
          onSubmit={(fields) => runAction(dialog.decision.id, dialog.actionType, fields)}
        />
      )}
    </PageTransition>
  );
}
