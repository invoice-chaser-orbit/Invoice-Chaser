import { getDecisions, getTrail } from "../../lib/decisions.js";
import { latestDecisionsByInvoice } from "../../lib/decision-history.js";

for (const decision of latestDecisionsByInvoice(await getDecisions()).filter(
  (item) => item.invoiceId === "INV-6021" || item.invoiceId === "INV-6022",
)) {
  const trail = await getTrail(decision.id);
  console.log({
    invoiceId: decision.invoiceId,
    decisionId: decision.id,
    status: decision.status,
    action: decision.action,
    reasoning: decision.reasoning,
    trail: trail.map((step) => ({ tool: step.toolName, input: step.input, output: step.output })),
  });
}
