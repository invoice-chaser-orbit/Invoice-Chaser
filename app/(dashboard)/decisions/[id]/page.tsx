import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DecisionDetail } from "@/components/dashboard/decision-detail";
import { getDecisions, getTrail } from "@/lib/decisions";
import { getInvoices } from "@/lib/invoices";
import { customerHistories } from "@/data/history";

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

  const [trail, invoices] = await Promise.all([getTrail(id), getInvoices()]);
  const decision = { ...found, trail };
  const invoice = invoices.find((i) => i.id === decision.invoiceId);
  const customer = customerHistories.find((c) => c.customerId === decision.customerId);

  return <DecisionDetail decision={decision} invoice={invoice} customer={customer} />;
}
