import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DecisionDetail } from "@/components/dashboard/decision-detail";
import { getDecisions, getTrail } from "@/lib/decisions";
import { getInvoiceCatalog } from "@/lib/invoices";
import { customerHistories } from "@/data/history";
import { latestDecisionsByInvoice } from "@/lib/decision-history";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Decision ${id} — InvoiceChaser`,
    description: `Goal, reasoning, audit trail and manual procedure for decision ${id}.`,
    openGraph: {
      title: `Decision ${id} — InvoiceChaser`,
      description: "Full reasoning and tool trail for a single agent decision.",
    },
  };
}

export default async function DecisionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decisions = await getDecisions();
  const found = decisions.find((d) => d.id === id);
  if (!found) notFound();

  const [trail, invoices] = await Promise.all([getTrail(id), getInvoiceCatalog()]);
  const decision = { ...found, trail };
  const invoice = invoices.find((i) => i.id === decision.invoiceId);
  const customer = customerHistories.find((c) => c.customerId === decision.customerId);
  const latestForInvoice = latestDecisionsByInvoice(decisions).find(
    (item) => item.invoiceId === decision.invoiceId,
  );

  return (
    <DecisionDetail
      decision={decision}
      invoice={invoice}
      customer={customer}
      latestDecisionId={latestForInvoice?.id !== decision.id ? latestForInvoice?.id : undefined}
    />
  );
}
