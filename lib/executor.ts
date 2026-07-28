import { supabase } from './supabase.js';
import { recordOutcome } from '../agent/memory.js';
import type { Decision } from './types.js';

export type HumanActionType = 'approve' | 'edit' | 'redirect' | 'override';

export interface HumanAction {
  actionType: HumanActionType;
  editedAction?: string;
  editedReasoning?: string;
  humanNote?: string;
}

export async function executeHumanAction(decision: Decision, humanAction: HumanAction): Promise<void> {
  // 1. Record the human's action for the audit trail
  const { error } = await supabase.from('human_actions').insert({
    decision_id: decision.id,
    action_type: humanAction.actionType,
    edited_action: humanAction.editedAction ?? null,
    edited_reasoning: humanAction.editedReasoning ?? null,
    human_note: humanAction.humanNote ?? null,
  });
  if (error) throw new Error(`Failed to record human action: ${error.message}`);

  // 2. Build the resolved decision (agent's original, overlaid with human's changes)
  const resolvedDecision: Decision = {
    ...decision,
    action: humanAction.editedAction ?? decision.action,
    reasoning: humanAction.editedReasoning ?? decision.reasoning,
    status: 'auto_executed', // human has now resolved it
  };

  // 3. Write back to outcome memory so future decisions reflect this
  await recordOutcome(resolvedDecision);

  // 4. TODO: actually perform the action (send email, etc.) — depends on Taluni's
  // Gmail adapter being callable from here; wire in once available
}