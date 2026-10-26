import { supabase } from "./supabase.js";
import type { Decision, TrailStep } from "./types.js";
import { latestDecisionsByInvoice } from "./decision-history.js";
import { isIncompleteDecision } from "./decision-state.js";

//savedecisions()
export async function saveDecision(decision: Decision): Promise<void> {
  // 1. Upsert the decision itself — a stub row is written before any trail steps exist
  // (trail_steps has a FK to decisions.id), then this same call updates it with final fields.
  const { error: decisionError } = await supabase.from("decisions").upsert({
    id: decision.id,
    invoice_id: decision.invoiceId,
    customer_id: decision.customerId,
    goal: decision.goal,
    action: decision.action,
    reasoning: decision.reasoning,
    manual_procedure: decision.manualProcedure,
    confidence: decision.confidence,
    escalation_reason: decision.escalationReason,
    status: decision.status,
    created_at: decision.createdAt,
  });

  if (decisionError) {
    throw new Error(`Failed to save decision: ${decisionError.message}`);
  }

  // 2. Insert each trail step, linked to this decision
  if (decision.trail.length > 0) {
    const trailRows = decision.trail.map((step: TrailStep) => ({
      decision_id: step.decisionId,
      step_index: step.stepIndex,
      tool_name: step.toolName,
      input: step.input,
      output: step.output,
      timestamp: step.timestamp,
      success: step.success,
    }));

    const { error: trailError } = await supabase.from("trail_steps").insert(trailRows);

    if (trailError) {
      throw new Error(`Failed to save trail steps: ${trailError.message}`);
    }
  }
}

//getdecisions()
export async function getDecisions(): Promise<Decision[]> {
  const [decisionResult, actionResult] = await Promise.all([
    supabase.from("decisions").select("*"),
    supabase
      .from("human_actions")
      .select("decision_id,action_type,created_at")
      .order("created_at", { ascending: false }),
  ]);
  const { data, error } = decisionResult;

  if (error) {
    throw new Error(`Failed to fetch decisions: ${error.message}`);
  }
  if (actionResult.error) {
    throw new Error(`Failed to fetch human actions: ${actionResult.error.message}`);
  }
  const humanActions = new Map<string, { type: string; createdAt: string }>();
  for (const action of actionResult.data ?? []) {
    const existing = humanActions.get(action.decision_id);
    if (!existing) {
      humanActions.set(action.decision_id, {
        type: action.action_type,
        createdAt: action.created_at,
      });
    } else if (
      action.action_type === "override" ||
      (action.action_type === "edit" && existing.type !== "override")
    ) {
      // Preserve a human change made while resolving Needs input, even if the
      // final email approval was a simple Approve click.
      humanActions.set(action.decision_id, { ...existing, type: action.action_type });
    }
  }

  return data.map((row) => ({
    id: row.id,
    invoiceId: row.invoice_id,
    customerId: row.customer_id,
    goal: row.goal,
    trail: [], // trail is fetched separately via getTrail() — not loaded here
    action: row.action,
    reasoning: row.reasoning,
    manualProcedure: row.manual_procedure,
    confidence: row.confidence,
    escalationReason: row.escalation_reason,
    status:
      row.status === "auto_executed" && humanActions.has(row.id)
        ? humanActions.get(row.id)?.type === "override"
          ? "human_overridden"
          : humanActions.get(row.id)?.type === "edit"
            ? "human_edited"
            : "human_approved"
        : row.status,
    createdAt: row.created_at,
    completedAt:
      row.status === "auto_executed"
        ? (humanActions.get(row.id)?.createdAt ?? row.created_at)
        : undefined,
  }));
}

// Only the current decision for an invoice can require approval. Historical
// pending rows remain in the audit trail but must not reappear as live work.
export async function getPendingDecisions(): Promise<Decision[]> {
  return latestDecisionsByInvoice(await getDecisions()).filter(
    (decision) =>
      !isIncompleteDecision(decision) &&
      (decision.status === "pending_approval" || decision.status === "ask_human"),
  );
}

//getTrail(decisionId)
export async function getTrail(decisionId: string): Promise<TrailStep[]> {
  const { data, error } = await supabase
    .from("trail_steps")
    .select("*")
    .eq("decision_id", decisionId)
    .order("step_index", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch trail: ${error.message}`);
  }

  return data.map((row) => ({
    decisionId: row.decision_id,
    stepIndex: row.step_index,
    toolName: row.tool_name,
    input: row.input,
    output: row.output,
    timestamp: row.timestamp,
    success: row.success,
  }));
}

//saveTrailStep()
export async function saveTrailStep(step: TrailStep): Promise<void> {
  const { error } = await supabase.from("trail_steps").insert({
    decision_id: step.decisionId,
    step_index: step.stepIndex,
    tool_name: step.toolName,
    input: step.input,
    output: step.output,
    timestamp: step.timestamp,
    success: step.success,
  });

  if (error) {
    throw new Error(`Failed to save trail step: ${error.message}`);
  }
}

//small get/set functions
export async function setDisputeStatus(
  invoiceId: string,
  status: "none" | "open" | "resolved",
): Promise<void> {
  const { error } = await supabase
    .from("invoices")
    .update({ dispute_status: status })
    .eq("id", invoiceId);

  if (error) {
    throw new Error(`Failed to set dispute status: ${error.message}`);
  }
}

export async function getDisputeStatus(invoiceId: string): Promise<"none" | "open" | "resolved"> {
  const { data, error } = await supabase
    .from("invoices")
    .select("dispute_status")
    .eq("id", invoiceId)
    .single();

  if (error) {
    throw new Error(`Failed to get dispute status: ${error.message}`);
  }

  return data.dispute_status;
}
