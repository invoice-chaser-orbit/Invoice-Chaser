import { randomUUID } from 'node:crypto';
import { getDecisions, saveDecision } from './decisions.js';
import type { Decision } from './types.js';

const SILENCE_THRESHOLD_DAYS = 7; // adjustable — worth confirming a demo-friendly value with the team

export interface SilenceCheckResult {
  invoiceId: string;
  originalDecisionId: string;
  newDecisionId: string;
  daysSinceDecision: number;
}

/**
 * Scans all auto_executed decisions (e.g. reminders sent) for ones with no reply
 * within SILENCE_THRESHOLD_DAYS, and creates a FRESH decision escalating each one.
 * Meant to run on a schedule (e.g. daily), not triggered by an incoming reply —
 * this is how the agent catches the ABSENCE of a response, not a response itself.
 */
export async function checkForSilentInvoices(): Promise<SilenceCheckResult[]> {
  const allDecisions = await getDecisions();
  const results: SilenceCheckResult[] = [];

  for (const decision of allDecisions) {
    // Only check decisions where the agent already sent something and is awaiting a reply
    if (decision.status !== 'auto_executed') continue;

    const decisionDate = new Date(decision.createdAt);
    const daysSince = Math.floor((Date.now() - decisionDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince < SILENCE_THRESHOLD_DAYS) continue;

    const newDecisionId = randomUUID();
    const escalationReason =
      `Sent "${decision.action}" on ${decision.createdAt}. No reply in ${daysSince} days ` +
      `(threshold: ${SILENCE_THRESHOLD_DAYS}). Customer has gone silent — no promise, dispute, or payment update.`;

    const silenceDecision: Decision = {
      id: newDecisionId,
      invoiceId: decision.invoiceId,
      customerId: decision.customerId,
      goal: `Follow up after ${daysSince} days of silence since prior action on this invoice.`,
      trail: [], // no tool calls needed — this is a scheduled timeout check, not a reasoning investigation
      action: 'escalate_silent_invoice',
      reasoning: `Original decision ${decision.id} received no response. Escalating per silence policy.`,
      manualProcedure: [
        `Check the date of the last action taken (${decision.createdAt})`,
        `Confirm no reply, payment, or CRM update has occurred since`,
        `If truly silent past the threshold, escalate for stronger follow-up or manual review`,
      ],
      confidence: 0.7,
      escalationReason,
      status: 'pending_approval',
      createdAt: new Date().toISOString(),
    };

    await saveDecision(silenceDecision);

    results.push({
      invoiceId: decision.invoiceId,
      originalDecisionId: decision.id,
      newDecisionId,
      daysSinceDecision: daysSince,
    });
  }

  return results;
}
