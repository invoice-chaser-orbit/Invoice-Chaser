// CRM adapter — simulated against seeded customer data (data/history.ts). A live
// HubSpot/Zoho adapter would export this same function with the same signature;
// agent/tools.ts's dispatcher would not change — only this file would.

import { customerHistories } from "../../data/history.js";

export async function getCustomerHistory(customerId: string) {
  const history = customerHistories.find(
    (h) => h.customerId.toLowerCase() === customerId.toLowerCase(),
  );
  return (
    history ?? {
      error:
        `No CRM/payment history found for customer ID "${customerId}". ` +
        `Use the exact customerId field from the get_invoice_details result (not the ` +
        `invoice ID and not the customer name) and try again.`,
    }
  );
}
