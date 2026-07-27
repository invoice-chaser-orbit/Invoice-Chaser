// Assert-based self-check for the pure logic extracted from agent/loop.ts. No framework, no
// network call — run with `npm run selfcheck`. Exits non-zero on any failed assert.

import assert from "node:assert";
import { deriveStatus, buildTurnBudgetEscalation } from "./loop.js";
import { dispatchTool } from "./tools.js";
import type { TrailStep } from "../lib/types.js";

// deriveStatus: ask_human always escalates regardless of confidence.
assert.strictEqual(deriveStatus("ask_human", 0.95), "ask_human");
assert.strictEqual(deriveStatus("ask_human", 0.1), "ask_human");

// deriveStatus: send_reminder_email below threshold still escalates.
assert.strictEqual(deriveStatus("send_reminder_email", 0.59), "ask_human");

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
assert.doesNotThrow(() => dispatchTool("ask_human", escalation));

console.log("agent/loop.selfcheck.ts: all checks passed.");
