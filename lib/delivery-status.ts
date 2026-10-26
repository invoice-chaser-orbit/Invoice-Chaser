import type { TrailStep } from "./types.js";

export type DeliveryOutcome = "sent" | "failed" | "simulated" | "blocked" | "queued" | "unverified";
export type DeliveryEvent = {
  stepIndex: number;
  channel: "Email" | "SMS";
  outcome: DeliveryOutcome;
  detail: string;
  timestamp: string;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export function getDeliveryEvents(trail: TrailStep[]): DeliveryEvent[] {
  return trail
    .filter((step) =>
      ["send_reminder_email", "send_sms_reminder", "send_approved_email"].some((name) =>
        step.toolName.startsWith(name),
      ),
    )
    .sort((a, b) => a.stepIndex - b.stepIndex)
    .map((step) => {
      const output = record(step.output);
      const sms = step.toolName.includes("sms") || output.channel === "sms";
      const channel = sms ? "SMS" : "Email";
      let outcome: DeliveryOutcome;
      if (step.toolName.endsWith("_degraded")) outcome = "queued";
      else if (!step.success) outcome = "failed";
      else if (output.blocked === true) outcome = "blocked";
      else if (output.simulated === true) outcome = "simulated";
      else if (typeof output.messageId === "string" && output.messageId.length > 0)
        outcome = "sent";
      else outcome = "unverified";

      const detail =
        outcome === "sent"
          ? `Provider message ID: ${String(output.messageId)}`
          : outcome === "simulated"
            ? "Simulated by the adapter; no real customer message was sent."
            : outcome === "failed"
              ? String(output.error ?? "The send attempt failed.")
              : outcome === "blocked"
                ? String(output.reason ?? "Sending was blocked.")
                : outcome === "queued"
                  ? "Queued after delivery attempts failed; no send is confirmed."
                  : "The trail does not contain provider confirmation.";

      return { stepIndex: step.stepIndex, channel, outcome, detail, timestamp: step.timestamp };
    });
}
