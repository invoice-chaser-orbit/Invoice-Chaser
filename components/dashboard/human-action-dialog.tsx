"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { IcButton } from "@/components/ui/ic-button";
import type { Decision, Invoice } from "@/lib/types";
import { displayDecisionAction } from "@/lib/decision-copy";
import { formatCustomerMessage } from "@/lib/customer-message";

type ActionType = "approve" | "edit" | "override";

export function HumanActionDialog({
  open,
  onOpenChange,
  actionType,
  decision,
  invoice,
  proposedMessage,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: ActionType;
  decision: Decision;
  invoice: Invoice | undefined;
  proposedMessage?: string;
  onSubmit: (fields: {
    editedAction?: string;
    editedReasoning?: string;
    humanNote?: string;
    customerMessage?: string;
  }) => void;
  submitting: boolean;
}) {
  const [editedAction, setEditedAction] = useState(
    proposedMessage
      ? formatCustomerMessage(proposedMessage)
      : displayDecisionAction(decision.action),
  );
  const [editedReasoning, setEditedReasoning] = useState(decision.reasoning);
  const [humanNote, setHumanNote] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");
  const needsInput = decision.status === "ask_human";
  const sendsCustomerEmail =
    decision.status === "pending_approval" &&
    actionType !== "override" &&
    Boolean(invoice?.email) &&
    !invoice?.email.toLowerCase().includes("replace_me");
  const edits = actionType !== "approve";
  const canSubmit =
    !submitting &&
    (!edits || (editedAction.trim() && editedReasoning.trim())) &&
    (actionType !== "override" || humanNote.trim()) &&
    (!needsInput || customerMessage.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-3">
        <DialogHeader className="space-y-2">
          <DialogTitle>
            {needsInput
              ? "Prepare for final approval"
              : actionType === "approve"
                ? "Approve this decision?"
                : actionType === "edit"
                  ? "Edit and approve"
                  : "Override decision"}
          </DialogTitle>
          <DialogDescription>
            {needsInput
              ? "Resolve this case and draft the customer email. It will move to Pending approval without sending anything."
              : actionType === "override"
                ? "Replace the agent's recommendation and give a reason. No customer email will be sent."
                : sendsCustomerEmail
                  ? `Send this message to ${invoice?.customerName ?? "the customer"} (${invoice?.email}).`
                  : "Confirm to record this decision. No customer email will be sent."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-body text-neutral-700">
          <p>
            <span className="font-semibold">Invoice:</span> {decision.invoiceId}
          </p>
          {edits ? (
            <>
              <div>
                <label
                  htmlFor="human-action-text"
                  className="text-caption text-neutral-500 uppercase"
                >
                  {proposedMessage && actionType === "edit" ? "Customer email" : "Action"}
                </label>
                <Textarea
                  id="human-action-text"
                  className="mt-1"
                  value={editedAction}
                  onChange={(e) => setEditedAction(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label
                  htmlFor="human-action-reasoning"
                  className="text-caption text-neutral-500 uppercase"
                >
                  Reasoning
                </label>
                <Textarea
                  id="human-action-reasoning"
                  className="mt-1"
                  value={editedReasoning}
                  onChange={(e) => setEditedReasoning(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label
                  htmlFor="human-action-note"
                  className="text-caption text-neutral-500 uppercase"
                >
                  Reason {actionType === "override" ? "(required)" : "(optional)"}
                </label>
                <Textarea
                  id="human-action-note"
                  className="mt-1"
                  value={humanNote}
                  onChange={(e) => setHumanNote(e.target.value)}
                  rows={2}
                  placeholder="Why are you making this change?"
                />
              </div>
            </>
          ) : (
            <div className="rounded-sm bg-neutral-50 px-3 py-2 whitespace-pre-wrap">
              {proposedMessage
                ? formatCustomerMessage(proposedMessage)
                : displayDecisionAction(decision.action)}
            </div>
          )}
          {needsInput && (
            <div>
              <label htmlFor="customer-message" className="text-caption text-neutral-500 uppercase">
                Customer email for final approval
              </label>
              <Textarea
                id="customer-message"
                className="mt-1"
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                rows={5}
                placeholder="Write the message the customer should receive. This will not send yet."
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <IcButton
            variant="outlined"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </IcButton>
          <IcButton
            size="sm"
            disabled={!canSubmit}
            onClick={() =>
              onSubmit({
                editedAction: edits ? editedAction.trim() : undefined,
                editedReasoning: edits ? editedReasoning.trim() : undefined,
                humanNote: humanNote.trim() || undefined,
                customerMessage: needsInput ? customerMessage.trim() : undefined,
              })
            }
          >
            {submitting
              ? "Submitting…"
              : needsInput
                ? "Move to Pending approval"
                : actionType === "override"
                  ? "Confirm override"
                  : sendsCustomerEmail
                    ? "Confirm & send"
                    : "Confirm decision"}
          </IcButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
