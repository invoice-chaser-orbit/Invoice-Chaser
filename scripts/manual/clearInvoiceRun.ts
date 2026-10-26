// Reset one demo invoice so the next daily scan can process it again.
import { supabase } from "../../lib/supabase.js";

const invoiceId = process.argv[2];
if (!invoiceId || !/^INV-\d+$/.test(invoiceId)) {
  throw new Error(
    "Usage: npx tsx --env-file=.env scripts/manual/clearInvoiceRun.ts INV-6023 [--apply]",
  );
}

const invoiceResult = await supabase
  .from("invoices")
  .select("id,customer_name,email")
  .eq("id", invoiceId);
if (invoiceResult.error) throw invoiceResult.error;
if (invoiceResult.data?.length !== 1) throw new Error(`Invoice ${invoiceId} was not found`);

const decisionResult = await supabase.from("decisions").select("*").eq("invoice_id", invoiceId);
if (decisionResult.error) throw decisionResult.error;
const decisions = decisionResult.data ?? [];
const ids = decisions.map((decision) => decision.id as string);
if (ids.length === 0) {
  console.log(`${invoiceId} has no decisions and is ready for a fresh scan.`);
  process.exit(0);
}

const [trailResult, actionResult] = await Promise.all([
  supabase.from("trail_steps").select("*").in("decision_id", ids),
  supabase.from("human_actions").select("id").in("decision_id", ids),
]);
if (trailResult.error || actionResult.error) throw trailResult.error ?? actionResult.error;
const trails = trailResult.data ?? [];
const actions = actionResult.data ?? [];
if (actions.length > 0) throw new Error("This invoice has human actions; refusing to clear it.");
if (
  trails.some(
    (step) =>
      step.success && ["send_reminder_email", "send_approved_email"].includes(step.tool_name),
  )
) {
  throw new Error("This invoice has a sent email; refusing to clear its decision history.");
}

console.log(
  `${invoiceId}: ${ids.length} decision(s), ${trails.length} trail step(s), no human actions or sent emails.`,
);
if (!process.argv.includes("--apply")) process.exit(0);

const trailDelete = await supabase.from("trail_steps").delete().in("decision_id", ids);
if (trailDelete.error) throw trailDelete.error;
const decisionDelete = await supabase.from("decisions").delete().in("id", ids);
if (decisionDelete.error) throw decisionDelete.error;
const verify = await supabase.from("decisions").select("id").eq("invoice_id", invoiceId);
if (verify.error || (verify.data ?? []).length > 0)
  throw new Error("Invoice decision cleanup was incomplete.");
console.log(`${invoiceId} is ready for a fresh agent scan. The invoice remains in the ledger.`);
