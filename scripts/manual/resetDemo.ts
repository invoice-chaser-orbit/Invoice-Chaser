// Back up live demo data, then replace invoice/decision state with the seed ledger.
// Usage: npx tsx --env-file=.env scripts/manual/resetDemo.ts inspect|sync|reset
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { supabase } from "../../lib/supabase.js";
import { seedInvoices } from "../../data/seed.js";
import { customerHistories } from "../../data/history.js";

const tables = [
  "customers",
  "invoices",
  "decisions",
  "trail_steps",
  "human_actions",
  "open_deals",
  "payment_history",
  "payment_promises",
] as const;
type Table = (typeof tables)[number];
type Row = Record<string, unknown>;

async function readAll(table: Table): Promise<Row[]> {
  const rows: Row[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(offset, offset + 499);
    if (error) throw new Error(`Reading ${table}: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < 500) return rows;
  }
}

async function removeRows(table: Table, ids: string[], column: string): Promise<void> {
  for (let offset = 0; offset < ids.length; offset += 100) {
    const batch = ids.slice(offset, offset + 100);
    const { error } = await supabase.from(table).delete().in(column, batch);
    if (error) throw new Error(`Deleting ${table}: ${error.message}`);
  }
  const remaining = await readAll(table);
  if (remaining.length)
    throw new Error(`${table} still has ${remaining.length} rows after deletion`);
}

async function main() {
  const mode = process.argv[2];
  if (mode !== "inspect" && mode !== "sync" && mode !== "reset")
    throw new Error("Use inspect, sync, or reset");
  const snapshot = Object.fromEntries(
    await Promise.all(tables.map(async (table) => [table, await readAll(table)])),
  ) as Record<Table, Row[]>;
  console.log(Object.fromEntries(tables.map((table) => [table, snapshot[table].length])));
  console.log(`Seed invoices: ${seedInvoices.length}; seed customers: ${customerHistories.length}`);
  if (mode === "inspect") {
    const statuses = new Map<string, number>();
    for (const decision of snapshot.decisions) {
      const status = String(decision.status);
      statuses.set(status, (statuses.get(status) ?? 0) + 1);
    }
    console.log("Decision statuses:", Object.fromEntries(statuses));
    console.log(
      "Distinct invoice IDs:",
      new Set(snapshot.decisions.map((row) => row.invoice_id)).size,
    );
    console.log(
      "Successful email sends:",
      snapshot.trail_steps.filter(
        (row) =>
          ["send_reminder_email", "send_approved_email"].includes(String(row.tool_name)) &&
          row.success === true,
      ).length,
    );
    console.log(
      "Failed email attempts:",
      snapshot.trail_steps.filter(
        (row) =>
          ["send_reminder_email", "send_approved_email"].includes(String(row.tool_name)) &&
          row.success === false,
      ).length,
    );
    return;
  }
  if (mode === "sync") {
    const existingInvoices = new Set(snapshot.invoices.map((row) => String(row.id)));
    const newInvoices = seedInvoices.filter((invoice) => !existingInvoices.has(invoice.id));
    const newCustomerIds = new Set(newInvoices.map((invoice) => invoice.customerId));
    const newCustomers = customerHistories
      .filter((customer) => newCustomerIds.has(customer.customerId))
      .map((customer) => ({
        customer_id: customer.customerId,
        customer_name: customer.customerName,
        relationship_years: customer.relationshipYears,
        annual_revenue: customer.annualRevenue,
        notes: customer.notes,
      }));
    if (newCustomers.length) {
      const { error } = await supabase
        .from("customers")
        .upsert(newCustomers, { onConflict: "customer_id" });
      if (error) throw new Error(`Syncing customers: ${error.message}`);
    }
    if (newInvoices.length) {
      const { error } = await supabase.from("invoices").insert(
        newInvoices.map((invoice) => ({
          id: invoice.id,
          customer_id: invoice.customerId,
          customer_name: invoice.customerName,
          amount_due: invoice.amountDue,
          amount_received: invoice.amountReceived ?? null,
          currency: invoice.currency,
          issue_date: invoice.issueDate,
          due_date: invoice.dueDate,
          days_overdue: invoice.daysOverdue,
          description: invoice.description,
          dispute_status: invoice.disputeStatus ?? "none",
          email: invoice.email,
        })),
      );
      if (error) throw new Error(`Syncing invoices: ${error.message}`);
    }
    console.log(
      `Added ${newInvoices.length} invoices and ${newCustomers.length} customer records.`,
    );
    return;
  }

  const backupDir = join(process.cwd(), ".demo-backups");
  await mkdir(backupDir, { recursive: true });
  const backupPath = join(
    backupDir,
    `supabase-before-reset-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
  );
  await writeFile(
    backupPath,
    JSON.stringify({ createdAt: new Date().toISOString(), tables: snapshot }, null, 2),
    { flag: "wx" },
  );
  console.log(`Backup saved: ${backupPath}`);

  await removeRows(
    "human_actions",
    snapshot.human_actions.map((r) => String(r.id)),
    "id",
  );
  await removeRows(
    "trail_steps",
    snapshot.decisions.map((r) => String(r.id)),
    "decision_id",
  );
  await removeRows(
    "decisions",
    snapshot.decisions.map((r) => String(r.id)),
    "id",
  );
  await removeRows(
    "invoices",
    snapshot.invoices.map((r) => String(r.id)),
    "id",
  );

  const customers = customerHistories.map((customer) => ({
    customer_id: customer.customerId,
    customer_name: customer.customerName,
    relationship_years: customer.relationshipYears,
    annual_revenue: customer.annualRevenue,
    notes: customer.notes ?? null,
  }));
  const customerResult = await supabase
    .from("customers")
    .upsert(customers, { onConflict: "customer_id" });
  if (customerResult.error) throw new Error(`Seeding customers: ${customerResult.error.message}`);

  const invoices = seedInvoices.map((invoice) => ({
    id: invoice.id,
    customer_id: invoice.customerId,
    customer_name: invoice.customerName,
    amount_due: invoice.amountDue,
    amount_received: invoice.amountReceived ?? null,
    currency: invoice.currency,
    issue_date: invoice.issueDate,
    due_date: invoice.dueDate,
    days_overdue: invoice.daysOverdue,
    description: invoice.description,
    dispute_status: invoice.disputeStatus ?? "none",
    email: invoice.email,
  }));
  const invoiceResult = await supabase.from("invoices").insert(invoices);
  if (invoiceResult.error) throw new Error(`Seeding invoices: ${invoiceResult.error.message}`);

  const currentInvoices = await readAll("invoices");
  const currentDecisions = await readAll("decisions");
  if (currentInvoices.length !== seedInvoices.length || currentDecisions.length !== 0) {
    throw new Error(
      `Reset verification failed: ${currentInvoices.length} invoices, ${currentDecisions.length} decisions`,
    );
  }
  console.log(`Reset complete: ${currentInvoices.length} invoices and no prior decisions.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
