import { getDecisions, getTrail } from "../../lib/decisions.js";
import { latestDecisionsByInvoice } from "../../lib/decision-history.js";
import { isIncompleteDecision } from "../../lib/decision-state.js";

const all = latestDecisionsByInvoice(await getDecisions());
const decisions = all.filter(
  (decision) =>
    isIncompleteDecision(decision) || ["INV-6022", "INV-6025"].includes(decision.invoiceId),
);
for (const decision of decisions) {
  const trail = await getTrail(decision.id);
  console.log({
    invoiceId: decision.invoiceId,
    createdAt: decision.createdAt,
    status: decision.status,
    incomplete: isIncompleteDecision(decision),
    steps: trail.map((step) => ({
      tool: step.toolName,
      success: step.success,
      error:
        step.output && typeof step.output === "object" && "error" in step.output
          ? String(step.output.error)
          : undefined,
    })),
  });
}
console.log(`Current incomplete invoices: ${all.filter(isIncompleteDecision).length}`);
