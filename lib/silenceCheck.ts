import { getDecisions } from "./decisions.js";
import { runSilenceCheck } from "../agent/loop.js";
import type { Decision } from "./types.js";

const SILENCE_THRESHOLD_DAYS = 7; // adjustable — worth confirming a demo-friendly value with the team

export async function checkForSilentInvoices(): Promise<Decision[]> {
  const allDecisions = await getDecisions();
  const results: Decision[] = [];

  for (const decision of allDecisions) {
    // Only check decisions where the agent already sent something and is awaiting a reply
    if (decision.status !== "auto_executed") continue;

    const daysSince = Math.floor(
      (Date.now() - new Date(decision.createdAt).getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSince < SILENCE_THRESHOLD_DAYS) continue;

    // Re-enters full reasoning via runSilenceCheck — the agent verifies via real tools
    // (e.g. check_payment_gateway) rather than assuming silence means non-payment.
    const newDecision = await runSilenceCheck(decision.invoiceId, decision.id, daysSince);
    results.push(newDecision);
  }

  return results;
}
