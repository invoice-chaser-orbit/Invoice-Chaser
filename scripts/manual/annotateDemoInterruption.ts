import { getDecisions, getTrail, saveTrailStep } from "../../lib/decisions.js";
import { latestDecisionsByInvoice } from "../../lib/decision-history.js";
import { isIncompleteDecision } from "../../lib/decision-state.js";

const decision = latestDecisionsByInvoice(await getDecisions()).find(
  (item) => item.invoiceId === "INV-6022",
);
if (!decision || !isIncompleteDecision(decision)) {
  throw new Error("INV-6022 does not have a current incomplete run.");
}
if ((await getTrail(decision.id)).length === 0) {
  await saveTrailStep({
    decisionId: decision.id,
    stepIndex: 1,
    toolName: "demo_interruption",
    input: { invoiceId: decision.invoiceId },
    output: {
      error: "Demo interruption before reasoning completed; rerun this invoice to recover.",
    },
    timestamp: new Date().toISOString(),
    success: false,
  });
}
console.log("Incomplete demo run has a recorded interruption step.");
