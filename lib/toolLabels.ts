// Plain-language labels for trail_steps.tool_name, for judges/finance officers reading the audit
// trail — the raw tool name stays visible alongside this, it's just not the primary label.

const BASE_LABELS: Record<string, string> = {
  get_invoice_details: "Checked the accounting system",
  get_dispute_evidence: "Checked dispute evidence in the accounting system",
  get_customer_history: "Checked CRM & payment history",
  get_payment_transactions: "Checked the payments system",
  send_reminder_email: "Sent a reminder email",
  send_sms_reminder: "Sent a reminder SMS",
  schedule_followup: "Scheduled a calendar follow-up",
  ask_human: "Escalated to a human",
};

const SUFFIX_LABELS: Record<string, (label: string) => string> = {
  _fallback: (label) => `${label} (fallback channel)`,
  _degraded: (label) => `${label} (queued — degraded)`,
};

export function humanizeToolName(toolName: string): string {
  for (const [suffix, wrap] of Object.entries(SUFFIX_LABELS)) {
    if (toolName.endsWith(suffix)) {
      const base = toolName.slice(0, -suffix.length);
      return wrap(BASE_LABELS[base] ?? base);
    }
  }
  return BASE_LABELS[toolName] ?? toolName;
}
