import type { Metadata } from "next";
import { DecisionsList } from "@/components/dashboard/decisions-list";
import { getDecisions } from "@/lib/decisions";
import { getInvoices } from "@/lib/invoices";

export const metadata: Metadata = {
  title: "Decisions — InvoiceChaser",
  description:
    "Every decision the collection agent has made, with status, confidence and the invoice it acted on.",
  openGraph: {
    title: "Decisions — InvoiceChaser",
    description: "Auto-executed, pending approval and escalated decisions.",
  },
};

export default async function DecisionsPage() {
  const [decisions, invoices] = await Promise.all([getDecisions(), getInvoices()]);
  return <DecisionsList decisions={decisions} invoices={invoices} />;
}
