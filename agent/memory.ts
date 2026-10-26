// Outcome memory — past decisions inform future ones. Now backed by Supabase
// instead of an in-memory Map, same two function signatures so nothing else changes.

import type { Decision } from "../lib/types.js";
import { saveDecision, getDecisions } from "../lib/decisions.js";
import { latestDecisionsByInvoice } from "../lib/decision-history.js";
import { isIncompleteDecision } from "../lib/decision-state.js";

export async function recordOutcome(decision: Decision): Promise<void> {
  await saveDecision(decision);
}

export async function getOutcomesForCustomer(customerId: string): Promise<Decision[]> {
  const allDecisions = await getDecisions();
  return latestDecisionsByInvoice(
    allDecisions.filter(
      (decision) =>
        decision.customerId === customerId &&
        !isIncompleteDecision(decision) &&
        ["auto_executed", "human_approved", "human_edited", "human_overridden"].includes(
          decision.status,
        ),
    ),
  ).slice(0, 5);
}
