// Run only newly added seed cases after the initial scan. The last case is
// intentionally interrupted after its initial record to demonstrate recovery.
import { runDailyScan } from "../../agent/loop.js";
import { getDecisions } from "../../lib/decisions.js";
import { latestDecisionsByInvoice } from "../../lib/decision-history.js";
import { isIncompleteDecision } from "../../lib/decision-state.js";

async function main() {
  process.env.DEMO_INTERRUPT_INVOICE_ID = "INV-6022";
  try {
    await runDailyScan((decision) => {
      console.log(`${decision.invoiceId}: ${decision.status}`);
    });
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("Demo interruption after")) {
      throw error;
    }
    console.log(error.message);
  } finally {
    delete process.env.DEMO_INTERRUPT_INVOICE_ID;
  }

  const byInvoice = new Map(
    latestDecisionsByInvoice(await getDecisions()).map((decision) => [
      decision.invoiceId,
      decision,
    ]),
  );
  const approval = byInvoice.get("INV-6021");
  const incomplete = byInvoice.get("INV-6022");
  if (approval?.status !== "pending_approval") {
    throw new Error(`Expected pending approval for INV-6021, got ${approval?.status ?? "none"}`);
  }
  if (!incomplete || !isIncompleteDecision(incomplete)) {
    throw new Error("Expected an incomplete run for INV-6022");
  }
  console.log("Verified: one pending approval and one incomplete run.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
