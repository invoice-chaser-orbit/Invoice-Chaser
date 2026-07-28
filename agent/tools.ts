// Tool definitions + dispatcher. Real function calls the agent chooses and executes against
// seeded data — not hardcoded branches. All five tool categories (accounting, CRM, email,
// payments, calendar/SMS) are covered. Never import the Gemini SDK here — see lib/llm.ts.

import type { ToolDefinition } from "../lib/llm.js";
import { seedInvoices } from "../data/seed.js";
import { customerHistories, paymentTransactions, disputeEvidence } from "../data/history.js";
import { checkForcedFailure } from "./debugToggle.js";
import { sendEmail } from "../lib/gmail.js";

export const TOOLS: ToolDefinition[] = [
  {
    name: "get_invoice_details",
    description:
      "Accounting system / aging report lookup. Returns amount due, days overdue, and " +
      "amount received if a partial payment was recorded, for one invoice.",
    parameters: {
      type: "object",
      properties: {
        invoiceId: { type: "string", description: "Invoice ID, e.g. INV-1043" },
      },
      required: ["invoiceId"],
    },
  },
  {
    name: "get_dispute_evidence",
    description:
      "Accounting system lookup: purchase-order match status and delivery confirmation for an " +
      "invoice under dispute. Call this before deciding anything else when get_invoice_details " +
      "shows disputeStatus \"open\" — never send a reminder to a disputing customer.",
    parameters: {
      type: "object",
      properties: {
        invoiceId: { type: "string", description: "Invoice ID, e.g. INV-4880" },
      },
      required: ["invoiceId"],
    },
  },
  {
    name: "get_customer_history",
    description:
      "CRM + payment history lookup for a customer: relationship length, account value, past " +
      "payment timing pattern, open deals, and any past payment promises. Use this before " +
      "choosing tone or urgency — lateness must be judged relative to this customer's own " +
      "pattern, not a fixed threshold, and an open deal can outweigh aging urgency.",
    parameters: {
      type: "object",
      properties: {
        customerId: { type: "string", description: "Customer ID, e.g. CUST-001" },
      },
      required: ["customerId"],
    },
  },
  {
    name: "send_reminder_email",
    description:
      "Send a collection reminder email to the customer. Simulated against a test inbox today " +
      "(same interface the live Gmail adapter will use). Only for pre-approved first-touch " +
      "reminders — anything beyond that (any escalation beyond a first reminder, a payment plan, " +
      "a discount, a deadline extension, a dispute response, or a legal/collections handoff) " +
      "must go through ask_human instead. Blocked automatically if the invoice has an open " +
      "dispute — use get_dispute_evidence and ask_human instead.",
    parameters: {
      type: "object",
      properties: {
        customerId: { type: "string" },
        tone: {
          type: "string",
          enum: ["warm", "neutral", "firm"],
          description: "Chosen based on relationship value and this customer's payment pattern.",
        },
        message: { type: "string", description: "The email body." },
      },
      required: ["customerId", "tone", "message"],
    },
  },
  {
    name: "ask_human",
    description:
      "Escalate to a human operator instead of guessing: confidence is below threshold, or the " +
      "case needs gated approval (any escalation beyond a first reminder, a payment plan, a " +
      "discount, a deadline extension, a dispute response, or a legal/collections handoff " +
      "recommendation). Never respond with a bare 'I don't know' — " +
      "this call must carry what was tried, what was found, what remains unresolved, and two or " +
      "three proposed options with a recommendation.",
    parameters: {
      type: "object",
      properties: {
        whatTried: { type: "string" },
        whatFound: { type: "string" },
        whatUnresolved: { type: "string" },
        options: {
          type: "array",
          items: { type: "string" },
          description: "Two or three proposed options for the human to choose from.",
        },
        recommendation: { type: "string" },
      },
      required: ["whatTried", "whatFound", "whatUnresolved", "options", "recommendation"],
    },
  },
  {
    name: "get_payment_transactions",
    description:
      "Payments system (Stripe/PayHere) lookup: past transactions for a customer, including any " +
      "recorded shortfalls and their confirmed reason (bank fee, withholding tax, partial " +
      "payment). Use this to check a current short-payment against this customer's own history " +
      "before concluding a reason — an empty result is a legitimate answer, not an error.",
    parameters: {
      type: "object",
      properties: {
        customerId: { type: "string", description: "Customer ID, e.g. CUST-001" },
      },
      required: ["customerId"],
    },
  },
  {
    name: "send_sms_reminder",
    description:
      "Send a collection reminder SMS to the customer (Twilio/Ideamart). Simulated today, same " +
      "interface the live adapter will use. Equivalent channel to send_reminder_email — only for " +
      "pre-approved first-touch reminders. Blocked automatically if the invoice has an open " +
      "dispute — use get_dispute_evidence and ask_human instead.",
    parameters: {
      type: "object",
      properties: {
        customerId: { type: "string" },
        tone: {
          type: "string",
          enum: ["warm", "neutral", "firm"],
          description: "Chosen based on relationship value and this customer's payment pattern.",
        },
        message: { type: "string", description: "The SMS body." },
      },
      required: ["customerId", "tone", "message"],
    },
  },
  {
    name: "schedule_followup",
    description:
      "Schedule a future follow-up check for this customer (Google Calendar). Autonomous " +
      "housekeeping — no human approval needed. Use when a case would benefit from a scheduled " +
      "recheck instead of an immediate escalation.",
    parameters: {
      type: "object",
      properties: {
        customerId: { type: "string" },
        followUpDate: { type: "string", description: "ISO date to check back, e.g. 2026-08-01" },
        reason: { type: "string", description: "Why this follow-up is being scheduled." },
      },
      required: ["customerId", "followUpDate", "reason"],
    },
  },
];

// ponytail: looks up the disputed invoice by customerId, assuming one invoice per customer in
// this demo dataset — thread invoiceId through the reminder tools instead if a customer ever
// carries multiple concurrent invoices.
function blockIfDisputed(customerId: unknown): { blocked: true; reason: string } | null {
  const invoice = seedInvoices.find(
    (inv) => inv.customerId.toLowerCase() === String(customerId ?? "").toLowerCase(),
  );
  if (invoice?.disputeStatus === "open") {
    return {
      blocked: true,
      reason:
        `Invoice ${invoice.id} has an open dispute — reminders are blocked. Call ` +
        `get_dispute_evidence and route to ask_human instead.`,
    };
  }
  return null;
}

export async function dispatchTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  checkForcedFailure(name);
  switch (name) {
    case "get_invoice_details": {
      const invoiceId = String(args.invoiceId ?? "");
      const invoice = seedInvoices.find((inv) => inv.id.toLowerCase() === invoiceId.toLowerCase());
      return invoice ?? { error: `No invoice found with ID ${invoiceId}` };
    }
    case "get_dispute_evidence": {
      const invoiceId = String(args.invoiceId ?? "");
      const evidence = disputeEvidence.find(
        (e) => e.invoiceId.toLowerCase() === invoiceId.toLowerCase(),
      );
      return evidence ?? { error: `No dispute evidence found for invoice ID ${invoiceId}` };
    }
    case "get_customer_history": {
      const customerId = String(args.customerId ?? "");
      const history = customerHistories.find(
        (h) => h.customerId.toLowerCase() === customerId.toLowerCase(),
      );
      return (
        history ?? {
          error:
            `No CRM/payment history found for customer ID "${customerId}". ` +
            `Use the exact customerId field from the get_invoice_details result (not the ` +
            `invoice ID and not the customer name) and try again.`,
        }
      );
    }
    case "send_reminder_email": {
      const blocked = blockIfDisputed(args.customerId);
      if (blocked) return blocked;
      const invoice = seedInvoices.find(
        (inv) => inv.customerId.toLowerCase() === String(args.customerId ?? "").toLowerCase(),
      );
      const to = invoice?.email;
      if (!to) throw new Error(`No email on file for customer ${args.customerId} — cannot send a real reminder email`);
      if (to.endsWith("@example.com")) {
        throw new Error(
          `${to} is still a REPLACE_ME placeholder in data/seed.ts — set a real address before ` +
            `running the agent live (Gmail send is real, not simulated).`,
        );
      }
      const sent = await sendEmail(
        to,
        `Payment reminder — ${invoice.id}`,
        String(args.message ?? ""),
      );
      return {
        messageId: sent.messageId,
        to,
        tone: args.tone,
        sentAt: new Date().toISOString(),
      };
    }
    case "ask_human": {
      return { received: true, note: "Escalation logged for human review." };
    }
    case "get_payment_transactions": {
      const customerId = String(args.customerId ?? "");
      const history = customerHistories.find(
        (h) => h.customerId.toLowerCase() === customerId.toLowerCase(),
      );
      if (!history) {
        return {
          error:
            `No CRM/payment history found for customer ID "${customerId}". ` +
            `Use the exact customerId field from the get_invoice_details result and try again.`,
        };
      }
      return {
        customerId,
        transactions: paymentTransactions.filter(
          (t) => t.customerId.toLowerCase() === customerId.toLowerCase(),
        ),
      };
    }
    case "send_sms_reminder": {
      const blocked = blockIfDisputed(args.customerId);
      if (blocked) return blocked;
      return {
        simulated: true,
        messageId: `sim-sms-${Date.now()}`,
        to: args.customerId,
        tone: args.tone,
        channel: "sms",
        sentAt: new Date().toISOString(),
      };
    }
    case "schedule_followup": {
      return {
        simulated: true,
        eventId: `sim-cal-${Date.now()}`,
        customerId: args.customerId,
        followUpDate: args.followUpDate,
        reason: args.reason,
        scheduledAt: new Date().toISOString(),
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
