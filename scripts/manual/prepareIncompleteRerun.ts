import { runInvoice } from "../../agent/loop.js";
import { getDecisions } from "../../lib/decisions.js";
import { latestDecisionsByInvoice } from "../../lib/decision-history.js";
import { isIncompleteDecision } from "../../lib/decision-state.js";

const invoiceIds = ["INV-6021", "INV-6023"];
const latest = new Map(
  latestDecisionsByInvoice(await getDecisions()).map((decision) => [decision.invoiceId, decision]),
);

for (const invoiceId of invoiceIds) {
  const existing = latest.get(invoiceId);
  if (existing) {
    if (!isIncompleteDecision(existing)) {
      throw new Error(
        `${invoiceId} already has a completed decision; refusing to add a demo interruption.`,
      );
    }
    console.log(`${invoiceId} is already incomplete.`);
    continue;
  }
  process.env.DEMO_INTERRUPT_INVOICE_ID = invoiceId;
  try {
    await runInvoice(invoiceId);
    throw new Error(`${invoiceId} unexpectedly completed.`);
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("Demo interruption after")) {
      throw error;
    }
    console.log(`${invoiceId}: demo run interrupted before any customer action.`);
  } finally {
    delete process.env.DEMO_INTERRUPT_INVOICE_ID;
  }
}

const verified = new Map(
  latestDecisionsByInvoice(await getDecisions()).map((decision) => [decision.invoiceId, decision]),
);
for (const invoiceId of invoiceIds) {
  const decision = verified.get(invoiceId);
  if (!decision || !isIncompleteDecision(decision)) {
    throw new Error(`${invoiceId} is not visible as an incomplete run.`);
  }
}
console.log("Both invoices are ready in Incomplete runs for a normal agent retry.");
