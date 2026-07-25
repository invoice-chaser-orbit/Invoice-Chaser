import { supabase } from './supabase';
import type { Decision, TrailStep } from './types';

//savedecisions()
export async function saveDecision(decision: Decision): Promise<void> {
  // 1. Insert the decision itself
  const { error: decisionError } = await supabase.from('decisions').insert({
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
    const trailRows = decision.trail.map((step) => ({
      decision_id: step.decisionId,
      step_index: step.stepIndex,
      tool_name: step.toolName,
      input: step.input,
      output: step.output,
      timestamp: step.timestamp,
      success: step.success,
    }));

    const { error: trailError } = await supabase.from('trail_steps').insert(trailRows);

    if (trailError) {
      throw new Error(`Failed to save trail steps: ${trailError.message}`);
    }
  }
}

//getdecisions()
export async function getDecisions(): Promise<Decision[]> {
  const { data, error } = await supabase.from('decisions').select('*');

  if (error) {
    throw new Error(`Failed to fetch decisions: ${error.message}`);
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
    status: row.status,
    createdAt: row.created_at,
  }));
}

//getpendingdecisions()
export async function getPendingDecisions(): Promise<Decision[]> {
  const { data, error } = await supabase
    .from('decisions')
    .select('*')
    .eq('status', 'pending_approval');

  if (error) {
    throw new Error(`Failed to fetch pending decisions: ${error.message}`);
  }

  return data.map((row) => ({
    id: row.id,
    invoiceId: row.invoice_id,
    customerId: row.customer_id,
    goal: row.goal,
    trail: [],
    action: row.action,
    reasoning: row.reasoning,
    manualProcedure: row.manual_procedure,
    confidence: row.confidence,
    escalationReason: row.escalation_reason,
    status: row.status,
    createdAt: row.created_at,
  }));
}

//getTrail(decisionId)
export async function getTrail(decisionId: string): Promise<TrailStep[]> {
  const { data, error } = await supabase
    .from('trail_steps')
    .select('*')
    .eq('decision_id', decisionId)
    .order('step_index', { ascending: true });

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
  const { error } = await supabase.from('trail_steps').insert({
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