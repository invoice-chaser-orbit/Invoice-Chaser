import type { Metadata } from "next";
import { ExecutedList } from "@/components/dashboard/executed-list";
import { getDecisions } from "@/lib/decisions";
import { getInvoiceCatalog } from "@/lib/invoices";

export const metadata: Metadata = {
  title: "Executed decisions — InvoiceChaser",
  description: "Completed agent and human decisions with links to their delivery trail.",
};

export default async function ExecutedPage() {
  const [decisions, invoices] = await Promise.all([getDecisions(), getInvoiceCatalog()]);
  return <ExecutedList decisions={decisions} invoices={invoices} />;
}
