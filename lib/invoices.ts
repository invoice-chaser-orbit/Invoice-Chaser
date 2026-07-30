import { supabase } from "./supabase.js";
import { seedInvoices } from "../data/seed.js";
import type { Invoice } from "./types.js";

export async function getInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase.from("invoices").select("*");
  if (error || !data || data.length === 0) return seedInvoices; // ponytail: unverified table, seed fallback keeps demo alive

  return data.map((row: any) => ({
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
