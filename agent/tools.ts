// Tool definitions + dispatcher. Real function calls the agent chooses and executes against
// seeded data — not hardcoded branches. Day 0 covers three of the five tool categories
// (accounting, CRM, email); payments and calendar/SMS are added Day 2. Never import the
// Gemini SDK here — see lib/llm.ts.

import type { ToolDefinition } from "../lib/llm.js";
import { seedInvoices } from "../data/seed.js";
import { customerHistories } from "../data/history.js";

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
      "reminders — anything beyond that (payment plan, discount, extension, dispute response) " +
      "must go through ask_human instead.",
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
      "case needs gated approval (anything beyond a first reminder, a payment plan, a discount, " +
      "a deadline extension, or a dispute response). Never respond with a bare 'I don't know' — " +
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
];

export function dispatchTool(name: string, args: Record<string, unknown>): unknown {
  switch (name) {
    case "get_invoice_details": {
      const invoiceId = String(args.invoiceId ?? "");
      const invoice = seedInvoices.find((inv) => inv.id.toLowerCase() === invoiceId.toLowerCase());
      return invoice ?? { error: `No invoice found with ID ${invoiceId}` };
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
      return {
        simulated: true,
        messageId: `sim-${Date.now()}`,
        to: args.customerId,
        tone: args.tone,
        sentAt: new Date().toISOString(),
      };
    }
    case "ask_human": {
      return { received: true, note: "Escalation logged for human review." };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
