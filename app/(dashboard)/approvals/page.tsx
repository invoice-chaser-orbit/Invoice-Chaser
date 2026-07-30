import type { Metadata } from "next";
import { ApprovalsQueue } from "@/components/dashboard/approvals-queue";
import { getPendingDecisions } from "@/lib/decisions";
import { getInvoices } from "@/lib/invoices";

export const metadata: Metadata = {
  title: "Approval queue — InvoiceChaser",
  description:
    "Gated decisions awaiting a human: approve, edit, redirect or override before anything is sent.",
  openGraph: {
    title: "Approval queue — InvoiceChaser",
    description: "Every commercial action stops here first.",
  },
};

export default async function ApprovalsPage() {
  const [decisions, invoices] = await Promise.all([getPendingDecisions(), getInvoices()]);
  return <ApprovalsQueue decisions={decisions} invoices={invoices} />;
}
