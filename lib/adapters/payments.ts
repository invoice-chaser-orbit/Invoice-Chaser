// Payments adapter — simulated against seeded transaction data (data/history.ts). A live
// Stripe/PayHere adapter would export this same function with the same signature;
// agent/tools.ts's dispatcher would not change — only this file would.

import { customerHistories, paymentTransactions } from "../../data/history.js";

export async function getPaymentTransactions(customerId: string) {
  const history = customerHistories.find(
    (h) => h.customerId.toLowerCase() === customerId.toLowerCase(),
  );
  if (!history) {
    return {
      error:
        `No CRM/payment history found for customer ID "${customerId}". ` +
        `Use the exact customerId field from the get_invoice_details result and try again.`,
    };
  }
  return {
    customerId,
    transactions: paymentTransactions.filter(
      (t) => t.customerId.toLowerCase() === customerId.toLowerCase(),
    ),
  };
}
