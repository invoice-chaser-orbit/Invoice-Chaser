// Outcome memory — past decisions inform future ones. Now backed by Supabase
// instead of an in-memory Map, same two function signatures so nothing else changes.

import type { Decision } from "../lib/types.js";
import { saveDecision, getDecisions } from "../lib/decisions.js";

export async function recordOutcome(decision: Decision): Promise<void> {
  await saveDecision(decision);
}

export async function getOutcomesForCustomer(customerId: string): Promise<Decision[]> {
  const allDecisions = await getDecisions();
  return allDecisions.filter((d) => d.customerId === customerId);
}