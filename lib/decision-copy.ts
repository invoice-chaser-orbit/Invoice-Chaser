export function displayDecisionAction(action: string): string {
  return action.replace(/^Escalated for human review\b/i, "Escalated for human approval");
}
