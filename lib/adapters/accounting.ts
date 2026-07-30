// Accounting adapter — simulated against seeded ledger data (data/seed.ts, data/history.ts).
// A live QuickBooks/Xero adapter would export these same two functions with the same
// signatures; agent/tools.ts's dispatcher would not change — only this file would.

import { seedInvoices } from "../../data/seed.js";
import { disputeEvidence } from "../../data/history.js";

export async function getInvoiceDetails(invoiceId: string) {
  const invoice = seedInvoices.find((inv) => inv.id.toLowerCase() === invoiceId.toLowerCase());
  return invoice ?? { error: `No invoice found with ID ${invoiceId}` };
}

export async function getDisputeEvidence(invoiceId: string) {
  const evidence = disputeEvidence.find(
    (e) => e.invoiceId.toLowerCase() === invoiceId.toLowerCase(),
  );
  return evidence ?? { error: `No dispute evidence found for invoice ID ${invoiceId}` };
}
