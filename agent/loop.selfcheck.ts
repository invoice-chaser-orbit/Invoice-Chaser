// Assert-based self-check for the pure logic extracted from agent/loop.ts. No framework, no
// network call — run with `npm run selfcheck`. Exits non-zero on any failed assert.

import assert from "node:assert";
import { deriveStatus, buildTurnBudgetEscalation } from "./loop.js";
import { dispatchTool } from "./tools.js";
import { seedInvoices } from "../data/seed.js";
import type { TrailStep } from "../lib/types.js";

// deriveStatus: ask_human always requires human approval regardless of confidence.
assert.strictEqual(deriveStatus("ask_human", 0.95), "pending_approval");
assert.strictEqual(deriveStatus("ask_human", 0.1), "pending_approval");

// deriveStatus: send_reminder_email below threshold still requires approval.
assert.strictEqual(deriveStatus("send_reminder_email", 0.59), "pending_approval");

// deriveStatus: send_reminder_email above threshold auto-executes.
assert.strictEqual(deriveStatus("send_reminder_email", 0.6), "auto_executed");
assert.strictEqual(deriveStatus("send_reminder_email", 0.9), "auto_executed");

// buildTurnBudgetEscalation: structured shape, non-empty fields, 2-3 options.
const trail: TrailStep[] = [
  {
    decisionId: "d1",
    stepIndex: 1,
    toolName: "get_invoice_details",
    input: { invoiceId: "INV-1043" },
    output: { ok: true },
    timestamp: new Date().toISOString(),
    success: true,
  },
];
const escalation = buildTurnBudgetEscalation(trail, "INV-1043", 5);
assert.ok(escalation.whatTried.length > 0, "whatTried must be non-empty");
assert.ok(escalation.whatFound.length > 0, "whatFound must be non-empty");
assert.ok(escalation.whatUnresolved.length > 0, "whatUnresolved must be non-empty");
assert.ok(
  escalation.options.length === 2 || escalation.options.length === 3,
  "options must have 2 or 3 entries",
);
assert.ok(escalation.recommendation.length > 0, "recommendation must be non-empty");

// buildTurnBudgetEscalation output must be a real, dispatchable ask_human call.
await assert.doesNotReject(() => dispatchTool("ask_human", escalation));

// get_dispute_evidence: returns the seeded evidence for the past-dispute fixture (INV-4880).
const evidence = (await dispatchTool("get_dispute_evidence", { invoiceId: "INV-4880" })) as {
  purchaseOrderStatus?: string;
  deliveryConfirmed?: boolean;
};
assert.strictEqual(evidence.purchaseOrderStatus, "matched");
assert.strictEqual(evidence.deliveryConfirmed, true);

// Dispute guard: send_reminder_email/send_sms_reminder must refuse a disputed invoice instead
// of simulating a send. None of the 5 locked seed invoices are disputed, so push a synthetic
// one just for this check, then remove it.
seedInvoices.push({
  id: "INV-9999",
  customerId: "CUST-TEST-DISPUTE",
  customerName: "Test Disputed Co",
  amountDue: 1000,
  currency: "LKR",
  issueDate: "2026-01-01",
  dueDate: "2026-01-15",
  daysOverdue: 5,
  description: "Self-check fixture only",
  disputeStatus: "open",
});
const blockedEmail = (await dispatchTool("send_reminder_email", {
  customerId: "CUST-TEST-DISPUTE",
  tone: "neutral",
  message: "test",
})) as { blocked?: boolean };
assert.strictEqual(blockedEmail.blocked, true, "send_reminder_email must block a disputed invoice");
const blockedSms = (await dispatchTool("send_sms_reminder", {
  customerId: "CUST-TEST-DISPUTE",
  tone: "neutral",
  message: "test",
})) as { blocked?: boolean };
assert.strictEqual(blockedSms.blocked, true, "send_sms_reminder must block a disputed invoice");
seedInvoices.pop();

console.log("agent/loop.selfcheck.ts: all checks passed.");
