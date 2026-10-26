import { supabase } from "./supabase.js";
import { recordOutcome } from "../agent/memory.js";
import { sendEmail } from "./gmail.js";
import { getInvoices } from "./invoices.js";
import type { Decision } from "./types.js";
import { isIncompleteDecision } from "./decision-state.js";
import { displayDecisionAction } from "./decision-copy.js";
import { formatCustomerMessage } from "./customer-message.js";
import { getTrail, saveTrailStep } from "./decisions.js";

export type HumanActionType = "approve" | "edit" | "redirect" | "override";

export interface HumanAction {
  actionType: HumanActionType;
  editedAction?: string;
  editedReasoning?: string;
  humanNote?: string;
  customerMessage?: string;
}

export async function executeHumanAction(
  decision: Decision,
  humanAction: HumanAction,
): Promise<{ emailSent: boolean; queuedForApproval: boolean }> {
  if (isIncompleteDecision(decision)) {
    throw new Error(
      "This agent run did not finish. Review its audit trail and run the agent again before approving an action.",
    );
  }
  if (decision.status !== "pending_approval" && decision.status !== "ask_human") {
    throw new Error("This decision has already been resolved.");
  }
  if (humanAction.actionType === "redirect") {
    throw new Error("Redirect is unavailable. Use Override to record a different outcome.");
  }
  if (humanAction.actionType === "override" && !humanAction.humanNote?.trim()) {
    throw new Error("Please give a reason for overriding this decision.");
  }
  if (
    humanAction.actionType !== "approve" &&
    (!humanAction.editedAction?.trim() || !humanAction.editedReasoning?.trim())
  ) {
    throw new Error("Action and reasoning are required.");
  }

  if (decision.status === "ask_human") {
    if (!humanAction.customerMessage?.trim()) {
      throw new Error("Write the customer email to place this case in Pending approval.");
    }
    const invoice = (await getInvoices()).find((item) => item.id === decision.invoiceId);
    if (!invoice?.email || invoice.email.toLowerCase().includes("replace_me")) {
      throw new Error("Add a valid customer email before preparing this case for approval.");
    }
    const trail = await getTrail(decision.id);
    const nextStepIndex = Math.max(-1, ...trail.map((step) => step.stepIndex)) + 1;
    const { error: actionError } = await supabase.from("human_actions").insert({
      decision_id: decision.id,
      action_type: humanAction.actionType,
      edited_action: humanAction.editedAction ?? null,
      edited_reasoning: humanAction.editedReasoning ?? null,
      human_note: humanAction.humanNote ?? null,
    });
    if (actionError) throw new Error(`Failed to record human action: ${actionError.message}`);
    await saveTrailStep({
      decisionId: decision.id,
      stepIndex: nextStepIndex,
      toolName: "human_prepared_email",
      input: { actionType: humanAction.actionType },
      output: {
        proposedMessage: formatCustomerMessage(humanAction.customerMessage),
        to: invoice.email,
      },
      timestamp: new Date().toISOString(),
      success: true,
    });
    const { error: queueError } = await supabase
      .from("decisions")
      .update({
        status: "pending_approval",
        action: humanAction.editedAction ?? decision.action,
        reasoning: humanAction.editedReasoning ?? decision.reasoning,
      })
      .eq("id", decision.id)
      .eq("status", "ask_human");
    if (queueError) throw new Error(`Failed to queue approval: ${queueError.message}`);
    return { emailSent: false, queuedForApproval: true };
  }

  // 1. Record the human's action for the audit trail
  const { error } = await supabase.from("human_actions").insert({
    decision_id: decision.id,
    action_type: humanAction.actionType,
    edited_action: humanAction.editedAction ?? null,
    edited_reasoning: humanAction.editedReasoning ?? null,
    human_note: humanAction.humanNote ?? null,
  });
  if (error) throw new Error(`Failed to record human action: ${error.message}`);

  // 2. Build the resolved decision (agent's original, overlaid with human's changes)
  const resolvedDecision: Decision = {
    ...decision,
    action: displayDecisionAction(humanAction.editedAction ?? decision.action),
    reasoning: humanAction.editedReasoning ?? decision.reasoning,
    // The database enum uses auto_executed for completed rows. Readers use the
    // human_actions record to display Human-approved, Human-edited, or Human-overridden instead.
    status: "auto_executed",
  };

  // 3. Write back to outcome memory so future decisions reflect this
  await recordOutcome(resolvedDecision);

  // 4. Perform the resolved action for real — a human has now signed off on it
  const invoices = await getInvoices();
  const invoice = invoices.find((inv) => inv.id === decision.invoiceId);
  const trail = await getTrail(decision.id);
  const approvalStep = [...trail]
    .reverse()
    .find(
      (step) =>
        step.toolName === "human_prepared_email" || step.toolName === "request_reminder_approval",
    );
  const proposedMessage =
    approvalStep?.output &&
    typeof approvalStep.output === "object" &&
    "proposedMessage" in approvalStep.output &&
    typeof approvalStep.output.proposedMessage === "string"
      ? approvalStep.output.proposedMessage
      : null;
  const nextStepIndex = Math.max(-1, ...trail.map((step) => step.stepIndex)) + 1;
  let emailSent = false;
  if (
    decision.status === "pending_approval" &&
    humanAction.actionType !== "override" &&
    invoice?.email &&
    !invoice.email.toLowerCase().includes("replace_me")
  ) {
    let messageId: string;
    try {
      const sent = await sendEmail(
        invoice.email,
        `Re: ${decision.invoiceId} — ${humanAction.actionType}`,
        formatCustomerMessage(
          humanAction.editedAction ?? proposedMessage ?? resolvedDecision.action,
        ),
      );
      messageId = sent.messageId;
    } catch (sendError) {
      await saveTrailStep({
        decisionId: decision.id,
        stepIndex: nextStepIndex,
        toolName: "send_approved_email",
        input: { to: invoice.email, actionType: humanAction.actionType },
        output: { error: String(sendError) },
        timestamp: new Date().toISOString(),
        success: false,
      });
      await recordOutcome({
        ...resolvedDecision,
        status: "ask_human",
        escalationReason:
          "The approved customer email failed to send. Review the delivery trail before retrying.",
      });
      throw sendError;
    }
    await saveTrailStep({
      decisionId: decision.id,
      stepIndex: nextStepIndex,
      toolName: "send_approved_email",
      input: { to: invoice.email, actionType: humanAction.actionType },
      output: { messageId, to: invoice.email },
      timestamp: new Date().toISOString(),
      success: true,
    });
    emailSent = true;
  } else {
    await saveTrailStep({
      decisionId: decision.id,
      stepIndex: nextStepIndex,
      toolName: "human_action_no_customer_message",
      input: { actionType: humanAction.actionType },
      output: { note: "Decision recorded without a customer message." },
      timestamp: new Date().toISOString(),
      success: true,
    });
  }

  return { emailSent, queuedForApproval: false };
}
