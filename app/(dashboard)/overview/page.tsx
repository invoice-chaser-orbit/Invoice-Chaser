import type { Metadata } from "next";
import { PageTransition } from "@/components/ui/motion-primitives";
import { OverviewPanel } from "@/components/dashboard/overview-panel";
import { getInvoices } from "@/lib/invoices";
import { getDecisions } from "@/lib/decisions";

export const metadata: Metadata = {
  title: "Dashboard overview — InvoiceChaser",
  description: "Live overdue receivables, pending approvals, and recent agent decisions.",
};

export default async function OverviewPage() {
  const [invoices, decisions] = await Promise.all([getInvoices(), getDecisions()]);
  return (
    <PageTransition>
      <OverviewPanel invoices={invoices} decisions={decisions} />
    </PageTransition>
  );
}
