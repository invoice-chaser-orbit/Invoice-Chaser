// Remove only the two disposable demo trial runs before rerunning the scenarios.
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { supabase } from "../../lib/supabase.js";

const invoiceIds = ["INV-6021", "INV-6022"];
const decisions = await supabase.from("decisions").select("*").in("invoice_id", invoiceIds);
if (decisions.error) throw decisions.error;
const ids = (decisions.data ?? []).map((row) => row.id as string);
if (ids.length === 0) {
  console.log("No demo trial runs to clear.");
  process.exit(0);
}
const [trails, actions] = await Promise.all([
  supabase.from("trail_steps").select("*").in("decision_id", ids),
  supabase.from("human_actions").select("*").in("decision_id", ids),
]);
if (trails.error || actions.error) throw trails.error ?? actions.error;
if ((actions.data ?? []).length > 0)
  throw new Error("A demo run has a human action; refusing to clear it.");
if (
  (trails.data ?? []).some(
    (step) =>
      step.success && ["send_reminder_email", "send_approved_email"].includes(step.tool_name),
  )
)
  throw new Error("A demo run sent an email; refusing to clear it.");

const backupDir = join(process.cwd(), ".demo-backups");
await mkdir(backupDir, { recursive: true });
await writeFile(
  join(backupDir, `demo-trials-${new Date().toISOString().replace(/[:.]/g, "-")}.json`),
  JSON.stringify({ decisions: decisions.data, trail_steps: trails.data }, null, 2),
  { flag: "wx" },
);
const trailDelete = await supabase.from("trail_steps").delete().in("decision_id", ids);
if (trailDelete.error) throw trailDelete.error;
const decisionDelete = await supabase.from("decisions").delete().in("id", ids);
if (decisionDelete.error) throw decisionDelete.error;
const verify = await supabase.from("decisions").select("id").in("invoice_id", invoiceIds);
if (verify.error || (verify.data ?? []).length > 0)
  throw new Error("Demo trial cleanup was incomplete.");
console.log(`Backed up and cleared ${ids.length} disposable demo trial runs.`);
