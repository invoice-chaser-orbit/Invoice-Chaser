// Sensing side for trigger type 3 (payment webhook — see CLAUDE.md "The loop"). CLI entry point
// simulating an inbound Stripe/PayHere webhook, since payments are simulated in this build (see
// CLAUDE.md's tool table). A live payments adapter would call runPaymentWebhookDecision directly
// from its webhook handler instead of this CLI — the reasoning core doesn't change either way.

import { pathToFileURL } from "node:url";
import { runPaymentWebhookDecision } from "./loop.js";
import { seedInvoices } from "../data/seed.js";

async function main(): Promise<void> {
  const [invoiceId, amountReceivedArg, transactionId] = process.argv.slice(2);
  if (!invoiceId || !amountReceivedArg) {
    console.error("Usage: npm run webhook -- <invoiceId> <amountReceived> [transactionId]");
    process.exitCode = 1;
    return;
  }

  const invoice = seedInvoices.find((inv) => inv.id === invoiceId);
  if (!invoice) throw new Error(`Unknown seed invoice: ${invoiceId}`);

  const amountReceived = Number(amountReceivedArg);
  if (Number.isNaN(amountReceived)) throw new Error(`Invalid amountReceived: "${amountReceivedArg}"`);

  console.log(`Simulating payment webhook: ${invoiceId} received Rs ${amountReceived.toLocaleString()}...`);
  const decision = await runPaymentWebhookDecision(invoice, {
    amountReceived,
    transactionId,
    receivedAt: new Date().toISOString(),
  });
  console.log(`-> ${decision.status} (confidence ${decision.confidence}): ${decision.action}`);
}

// Same gating pattern as agent/loop.ts and agent/pollReplies.ts — only run when executed directly.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((err) => {
    console.error("Payment webhook run failed:", err);
    process.exitCode = 1;
  });
}
