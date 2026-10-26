import type { Decision } from "./types.js";

// An agent run writes an empty decision first, then fills it when reasoning finishes.
// Interrupted runs must never be treated as recommendations awaiting approval.
export function isIncompleteDecision(
  decision: Pick<Decision, "action" | "reasoning" | "manualProcedure">,
): boolean {
  return (
    !decision.action?.trim() ||
    !decision.reasoning?.trim() ||
    !Array.isArray(decision.manualProcedure) ||
    decision.manualProcedure.length === 0
  );
}
