// Outcome memory — past decisions inform future ones. In-memory today; Day 2 swaps this for
// Supabase behind the same two function signatures, so nothing else has to change.

import type { Decision } from "../lib/types.js";

const outcomesByCustomer = new Map<string, Decision[]>();

export function recordOutcome(decision: Decision): void {
  const existing = outcomesByCustomer.get(decision.customerId) ?? [];
  existing.push(decision);
  outcomesByCustomer.set(decision.customerId, existing);
}

export function getOutcomesForCustomer(customerId: string): Decision[] {
  return outcomesByCustomer.get(customerId) ?? [];
}
