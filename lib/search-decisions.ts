import type { Decision, Invoice } from "./types.js";
import { isIncompleteDecision } from "./decision-state.js";
import { displayDecisionAction } from "./decision-copy.js";

export type DecisionSearchHit = {
  id: string;
  customer: string;
  invoiceId: string;
  action: string;
  status: string;
  createdAt: string;
};

const statusLabels: Record<Decision["status"], string> = {
  auto_executed: "Auto-executed",
  pending_approval: "Pending approval",
  ask_human: "Needs input",
  human_approved: "Human-approved",
  human_edited: "Human-edited",
  human_overridden: "Human-overridden",
};

export function searchDecisions(
  decisions: Decision[],
  invoices: Invoice[],
  query: string,
): DecisionSearchHit[] {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const invoiceById = new Map(invoices.map((invoice) => [invoice.id, invoice]));

  return decisions
    .filter((decision) => {
      const invoice = invoiceById.get(decision.invoiceId);
      const status = isIncompleteDecision(decision)
        ? "Incomplete run"
        : statusLabels[decision.status];
      const searchable = [
        decision.id,
        decision.invoiceId,
        decision.customerId,
        invoice?.customerName,
        invoice?.description,
        invoice?.amountDue,
        decision.action,
        decision.reasoning,
        decision.escalationReason,
        status,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLocaleLowerCase();
      return terms.every((term) => searchable.includes(term));
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((decision) => ({
      id: decision.id,
      customer: invoiceById.get(decision.invoiceId)?.customerName ?? decision.customerId,
      invoiceId: decision.invoiceId,
      action: decision.action
        ? displayDecisionAction(decision.action)
        : "Run ended before an action was produced",
      status: isIncompleteDecision(decision) ? "Incomplete run" : statusLabels[decision.status],
      createdAt: decision.createdAt,
    }));
}
