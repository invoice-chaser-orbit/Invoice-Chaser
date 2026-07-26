// Multi-turn function-calling loop. Runs sense -> reason -> act -> observe for each seeded
// invoice and captures a real TrailStep[]. This is the Day 0 gate: run with
// `npx tsx --env-file=.env agent/loop.ts` (or `npm run agent`) and expect five decisions, each
// showing genuine functionCall parts, not tool names written as prose.

import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import { generateWithTools, generateDecision, type LlmMessage } from "../lib/llm.js";
import { TOOLS, dispatchTool } from "./tools.js";
import { SYSTEM_PROMPT, CONFIDENCE_THRESHOLD } from "./prompts.js";
import { seedInvoices } from "../data/seed.js";
import { recordOutcome, getOutcomesForCustomer } from "./memory.js";
import type { Decision, DecisionStatus, TrailStep } from "../lib/types.js";

const TURN_DELAY_MS = 5000; // free-tier is ~10 RPM; without this the gate fails on quota, not code
const MAX_TOOL_TURNS = 5;
const TOOL_NAMES = TOOLS.map((t) => t.name);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Status is derived from which terminal tool was actually dispatched, never from the model's
// self-reported output.status alone — otherwise a decision record could claim an action (e.g.
// "auto_executed") that was never really taken, which is the same class of bug as writing a
// tool name in prose instead of calling it.
export function deriveStatus(
  terminalTool: "ask_human" | "send_reminder_email" | null,
  confidence: number,
): DecisionStatus {
  const belowThreshold = confidence < CONFIDENCE_THRESHOLD;
  return terminalTool === "ask_human" || belowThreshold ? "ask_human" : "auto_executed";
}

// Turn budget exhausted without the model taking a real terminal action. This is a genuine
// operational failure (analogous to a timeout), not a faked escalation — so the caller dispatches
// this as a real ask_human call and logs it, same as any other tool call, rather than inventing
// a decision.
export function buildTurnBudgetEscalation(
  trail: TrailStep[],
  invoiceId: string,
  maxTurns: number,
): {
  whatTried: string;
  whatFound: string;
  whatUnresolved: string;
  options: string[];
  recommendation: string;
} {
  return {
    whatTried: `Called ${trail.length} tool(s) while investigating ${invoiceId}.`,
    whatFound: trail.length > 0 ? "See the trail above for what each tool returned." : "No data was retrieved.",
    whatUnresolved: `No confident action was reached within ${maxTurns} reasoning turns.`,
    options: [
      "Have a human review the trail above and decide manually.",
      "Re-run the agent with a higher turn budget in case it simply needed more steps.",
      "Treat this as a data gap and check whether the seeded invoice/customer records are complete.",
    ],
    recommendation: "Manual review required — the agent's turn budget was exhausted.",
  };
}

async function runInvoice(invoiceId: string): Promise<Decision> {
  const invoice = seedInvoices.find((inv) => inv.id === invoiceId);
  if (!invoice) throw new Error(`Unknown seed invoice: ${invoiceId}`);

  const decisionId = randomUUID();
  const goal =
    `Decide the right collection action for invoice ${invoice.id} ` +
    `(${invoice.customerName}, Rs ${invoice.amountDue.toLocaleString()}), minimising overdue ` +
    `receivables without damaging the relationship.`;

  // Outcome memory: earlier decisions for this same customer, within this run, feed back into
  // this one — same intent as CLAUDE.md's promise that outcome memory changes future behaviour.
  const priorOutcomes = getOutcomesForCustomer(invoice.customerId);
  const priorOutcomesText =
    priorOutcomes.length > 0
      ? `\n\nPrior decisions for this customer, earlier in this run:\n${priorOutcomes
          .map((d) => `- ${d.action} (status: ${d.status}, confidence: ${d.confidence})`)
          .join("\n")}`
      : "";

  const messages: LlmMessage[] = [
    { role: "system", text: SYSTEM_PROMPT },
    { role: "user", text: `${goal}\nInvoice ID to investigate: ${invoice.id}${priorOutcomesText}` },
  ];

  const trail: TrailStep[] = [];
  let stepIndex = 0;
  let toolTurns = 0;

  // A decision may only be finalised after a REAL terminal tool call (ask_human or
  // send_reminder_email) has been dispatched and logged — never from prose describing an
  // intended action. This is the guard against the 21 July bug: tool names written as text
  // instead of genuine function calls. Which tool fired is also what determines the final
  // status below — never the model's self-reported status alone.
  let terminalTool: "ask_human" | "send_reminder_email" | null = null;

  while (toolTurns < MAX_TOOL_TURNS && !terminalTool) {
    if (toolTurns > 0) await sleep(TURN_DELAY_MS);
    const response = await generateWithTools(messages, TOOLS);

    if (response.toolCalls.length === 0) {
      const fakedToolUse = TOOL_NAMES.some((name) => response.text.includes(name));
      if (fakedToolUse) {
        console.warn(
          `  [WARN] ${invoice.id}: model described an action in plain text instead of calling ` +
            `the tool — nudging it to take a real action.`,
        );
      }
      messages.push({ role: "model", text: response.text });
      messages.push({
        role: "user",
        text:
          "You have not called a tool yet. Continue investigating with get_invoice_details / " +
          "get_customer_history, or take the terminal action with send_reminder_email or " +
          "ask_human. Do not describe an action without calling its tool.",
      });
      toolTurns += 1;
      continue;
    }

    messages.push({ role: "model", text: response.text, toolCalls: response.toolCalls });

    const toolResults: { name: string; result: unknown }[] = [];
    for (const call of response.toolCalls) {
      let output: unknown;
      let success = true;
      try {
        output = dispatchTool(call.name, call.args);
      } catch (err) {
        output = { error: err instanceof Error ? err.message : String(err) };
        success = false;
      }
      stepIndex += 1;
      trail.push({
        decisionId,
        stepIndex,
        toolName: call.name,
        input: call.args,
        output,
        timestamp: new Date().toISOString(),
        success,
      });
      toolResults.push({ name: call.name, result: output });
    }
    messages.push({ role: "tool", toolResults });
    toolTurns += 1;

    const calledAskHuman = response.toolCalls.some((call) => call.name === "ask_human");
    const calledSendEmail = response.toolCalls.some((call) => call.name === "send_reminder_email");
    if (calledAskHuman) terminalTool = "ask_human";
    else if (calledSendEmail) terminalTool = "send_reminder_email";
  }

  if (!terminalTool) {
    const escalationArgs = buildTurnBudgetEscalation(trail, invoice.id, MAX_TOOL_TURNS);
    stepIndex += 1;
    const output = dispatchTool("ask_human", escalationArgs);
    trail.push({
      decisionId,
      stepIndex,
      toolName: "ask_human",
      input: escalationArgs,
      output,
      timestamp: new Date().toISOString(),
      success: true,
    });
    messages.push({ role: "tool", toolResults: [{ name: "ask_human", result: output }] });
    terminalTool = "ask_human";
  }

  await sleep(TURN_DELAY_MS);
  messages.push({
    role: "user",
    text: "You now have everything you need. Produce your final decision as structured output.",
  });
  const output = await generateDecision(messages);

  const status: DecisionStatus = deriveStatus(terminalTool, output.confidence);

  const decision: Decision = {
    id: decisionId,
    invoiceId: invoice.id,
    customerId: invoice.customerId,
    goal,
    trail,
    action: output.action,
    reasoning: output.reasoning,
    manualProcedure: output.manualProcedure,
    confidence: output.confidence,
    escalationReason: status === "ask_human" ? output.escalationReason || output.reasoning : null,
    status,
    createdAt: new Date().toISOString(),
  };

  recordOutcome(decision);
  return decision;
}

function printDecision(decision: Decision, invoiceLabel: string): void {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`DECISION — ${invoiceLabel}`);
  console.log("=".repeat(70));
  console.log(`Status: ${decision.status}  |  Confidence: ${decision.confidence}`);

  console.log(`\nTrail (${decision.trail.length} real tool call(s)):`);
  for (const step of decision.trail) {
    console.log(`  ${step.stepIndex}. ${step.toolName}(${JSON.stringify(step.input)})`);
    console.log(`     -> ${JSON.stringify(step.output)}${step.success ? "" : "  [FAILED]"}`);
  }

  console.log(`\nAction: ${decision.action}`);
  console.log(`\nReasoning: ${decision.reasoning}`);
  if (decision.escalationReason) {
    console.log(`\nEscalation: ${decision.escalationReason}`);
  }
  console.log(`\nManual procedure (teach-me):`);
  decision.manualProcedure.forEach((step, i) => console.log(`  ${i + 1}. ${step}`));
}

async function main(): Promise<void> {
  console.log(`Running InvoiceChaser agent over ${seedInvoices.length} seeded invoices...`);
  const decisions: Decision[] = [];

  for (let i = 0; i < seedInvoices.length; i++) {
    const invoice = seedInvoices[i];
    console.log(`\nInvestigating ${invoice.id} (${invoice.customerName})...`);
    const decision = await runInvoice(invoice.id);
    decisions.push(decision);
    printDecision(decision, `${invoice.id} — ${invoice.customerName}`);
    if (i < seedInvoices.length - 1) await sleep(TURN_DELAY_MS);
  }

  console.log(`\n${"=".repeat(70)}`);
  console.log(`Day 0 gate: ${decisions.length}/${seedInvoices.length} decisions produced.`);
  console.log(`  Escalated to ask_human: ${decisions.filter((d) => d.status === "ask_human").length}`);
  const allUsedRealTools = decisions.every((d) => d.trail.length > 0);
  console.log(`  Every decision used at least one real tool call: ${allUsedRealTools ? "yes" : "NO — investigate"}`);
}

// Only run the live agent when this file is executed directly (npm run agent), not when it's
// imported elsewhere for its exported functions (e.g. agent/loop.selfcheck.ts) — otherwise every
// import would kick off a real Gemini run.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((err) => {
    console.error("Agent run failed:", err);
    process.exitCode = 1;
  });
}
