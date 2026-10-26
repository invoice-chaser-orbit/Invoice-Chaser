import { supabase } from "../../lib/supabase.js";
import { seedInvoices } from "../../data/seed.js";

const recipients = new Set(seedInvoices.map((invoice) => invoice.email));
if (recipients.size !== 1) throw new Error("The seed invoices do not share one demo recipient.");
const recipient = seedInvoices[0].email;
const invoiceIds = seedInvoices.map((invoice) => invoice.id);
const { data, error } = await supabase
  .from("invoices")
  .update({ email: recipient })
  .in("id", invoiceIds)
  .select("id,email");
if (error || data?.length !== invoiceIds.length || data.some((row) => row.email !== recipient)) {
  throw new Error(
    `Could not update every demo recipient: ${error?.message ?? "verification failed"}`,
  );
}
console.log(`Updated ${data.length} invoice recipients in Supabase.`);
