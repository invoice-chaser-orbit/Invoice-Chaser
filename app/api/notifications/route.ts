import { getDecisions } from "@/lib/decisions";
import { getInvoiceCatalog } from "@/lib/invoices";
import { isIncompleteDecision } from "@/lib/decision-state";
import { latestDecisionsByInvoice } from "@/lib/decision-history";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [decisions, invoices] = await Promise.all([getDecisions(), getInvoiceCatalog()]);
    const names = new Map(invoices.map((invoice) => [invoice.id, invoice.customerName]));
    const sorted = latestDecisionsByInvoice(decisions);
    const needsReview = sorted.filter(
      (decision) =>
        !isIncompleteDecision(decision) &&
        (decision.status === "pending_approval" || decision.status === "ask_human"),
    );
    const incomplete = sorted.filter(isIncompleteDecision);
    const formatItem = (decision: (typeof decisions)[number]) => ({
      id: decision.id,
      customer: names.get(decision.invoiceId) ?? decision.customerId,
      invoiceId: decision.invoiceId,
      reason: decision.escalationReason || decision.reasoning || "The agent run did not finish.",
      status: decision.status,
    });

    return Response.json({
      reviewCount: needsReview.length,
      incompleteCount: incomplete.length,
      needsReview: needsReview.slice(0, 5).map(formatItem),
      incomplete: incomplete.slice(0, 5).map(formatItem),
    });
  } catch {
    return Response.json({ error: "Notifications are unavailable right now." }, { status: 500 });
  }
}
