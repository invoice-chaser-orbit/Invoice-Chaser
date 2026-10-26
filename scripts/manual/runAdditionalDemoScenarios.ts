// Create the three extra demo cases without rerunning the existing incomplete case.
import { runInvoice } from "../../agent/loop.js";
import { getDecisions } from "../../lib/decisions.js";
import { latestDecisionsByInvoice } from "../../lib/decision-history.js";
import { isIncompleteDecision } from "../../lib/decision-state.js";

const approvalIds = ["INV-6023", "INV-6024"];
const interruptionId = "INV-6025";

async function main() {
  let current = new Map(
    latestDecisionsByInvoice(await getDecisions()).map((decision) => [
      decision.invoiceId,
      decision,
    ]),
  );
  for (const id of approvalIds) {
    if (!current.has(id)) {
      const decision = await runInvoice(id);
      console.log(`${id}: ${decision.status}`);
    }
  }
  if (!current.has(interruptionId)) {
    process.env.DEMO_INTERRUPT_INVOICE_ID = interruptionId;
    try {
      await runInvoice(interruptionId);
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("Demo interruption after")) {
        throw error;
      }
      console.log(error.message);
    } finally {
      delete process.env.DEMO_INTERRUPT_INVOICE_ID;
    }
  }

  current = new Map(
    latestDecisionsByInvoice(await getDecisions()).map((decision) => [
      decision.invoiceId,
      decision,
    ]),
  );
  for (const id of approvalIds) {
    if (current.get(id)?.status !== "pending_approval" || isIncompleteDecision(current.get(id)!)) {
      throw new Error(`${id} did not finish as Pending approval.`);
    }
  }
  const incomplete = current.get(interruptionId);
  if (!incomplete || !isIncompleteDecision(incomplete)) {
    throw new Error(`${interruptionId} did not finish as an Incomplete run.`);
  }
  console.log("Verified: two new pending approvals and one new incomplete run.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
