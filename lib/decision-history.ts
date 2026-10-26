import type { Decision } from "./types.js";

// Keep every run in storage for the audit trail, but show only the newest run
// for each invoice when presenting the current state of the ledger.
export function latestDecisionsByInvoice(decisions: Decision[]): Decision[] {
  const latest = new Map<string, Decision>();
  for (const decision of decisions) {
    const previous = latest.get(decision.invoiceId);
    if (
      !previous ||
      decision.createdAt > previous.createdAt ||
      (decision.createdAt === previous.createdAt && decision.id > previous.id)
    ) {
      latest.set(decision.invoiceId, decision);
    }
  }
  return [...latest.values()].sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
  );
}
