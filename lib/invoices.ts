import { supabase } from "./supabase.js";
import { seedInvoices } from "../data/seed.js";
import type { Invoice } from "./types.js";

export async function getInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase.from("invoices").select("*");
  if (error || !data || data.length === 0) return seedInvoices; // seed fallback keeps the demo available

  return data.map((row) => ({
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    amountDue: row.amount_due,
    amountReceived: row.amount_received ?? undefined,
    currency: row.currency,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    daysOverdue: row.days_overdue,
    description: row.description,
    disputeStatus: row.dispute_status,
    email: row.email,
  }));
}

// Decision history includes seeded invoices that have not been copied into the
// Supabase invoice table. Use their seed details for labels and search without
// adding those amounts to the database-backed cash-flow dashboard.
export async function getInvoiceCatalog(): Promise<Invoice[]> {
  const invoices = new Map(seedInvoices.map((invoice) => [invoice.id, invoice]));
  for (const invoice of await getInvoices()) invoices.set(invoice.id, invoice);
  return [...invoices.values()];
}
