import { supabase } from "./supabase.js";
import { recordOutcome } from "../agent/memory.js";
import { sendEmail } from "./gmail.js";
import { getInvoices } from "./invoices.js";
import type { Decision } from "./types.js";

export type HumanActionType = "approve" | "edit" | "redirect" | "override";

export interface HumanAction {
  actionType: HumanActionType;
  editedAction?: string;
  editedReasoning?: string;
  humanNote?: string;
}

export async function executeHumanAction(
  decision: Decision,
  humanAction: HumanAction,
): Promise<{ emailSent: boolean }> {
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
    action: humanAction.editedAction ?? decision.action,
    reasoning: humanAction.editedReasoning ?? decision.reasoning,
    status: "auto_executed", // human has now resolved it
  };

  // 3. Write back to outcome memory so future decisions reflect this
  await recordOutcome(resolvedDecision);

  // 4. Perform the resolved action for real — a human has now signed off on it
  const invoices = await getInvoices();
  const invoice = invoices.find((inv) => inv.id === decision.invoiceId);
  let emailSent = false;
  if (invoice?.email) {
    await sendEmail(
      invoice.email,
      `Re: ${decision.invoiceId} — ${humanAction.actionType}`,
      resolvedDecision.action,
    );
    emailSent = true;
  }

  return { emailSent };
}
