import type { Metadata } from "next";
import { ApprovalsQueue } from "@/components/dashboard/approvals-queue";
import { getPendingDecisions, getTrail } from "@/lib/decisions";
import { getInvoices } from "@/lib/invoices";
import type { TrailStep } from "@/lib/types";

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
  const trails = await Promise.all(decisions.map((d) => getTrail(d.id)));
  const trailsByDecisionId: Record<string, TrailStep[]> = Object.fromEntries(
    decisions.map((d, i) => [d.id, trails[i]]),
  );
  return (
    <ApprovalsQueue decisions={decisions} invoices={invoices} trailsByDecisionId={trailsByDecisionId} />
  );
}
