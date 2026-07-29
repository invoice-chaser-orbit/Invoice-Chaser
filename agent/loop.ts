// Multi-turn function-calling loop. Runs sense -> reason -> act -> observe for each seeded
// invoice and captures a real TrailStep[]. This is the Day 0 gate: run with
// `npx tsx --env-file=.env agent/loop.ts` (or `npm run agent`) and expect five decisions, each
// showing genuine functionCall parts, not tool names written as prose.

import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import { generateWithTools, generateDecision, type LlmMessage } from "../lib/llm.js";
import { TOOLS, dispatchTool } from "./tools.js";
import { withRecovery } from "./recovery.js";
import { SYSTEM_PROMPT, CONFIDENCE_THRESHOLD } from "./prompts.js";
import { seedInvoices } from "../data/seed.js";
import { recordOutcome, getOutcomesForCustomer } from "./memory.js";
import type { ReplyClassification } from "./classifier.js";
import type { Decision, DecisionStatus, Invoice, TrailStep } from "../lib/types.js";

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
  terminalTool: "ask_human" | "send_reminder_email" | "send_sms_reminder" | null,
  confidence: number,
): DecisionStatus {
  const belowThreshold = confidence < CONFIDENCE_THRESHOLD;
  return terminalTool === "ask_human" || belowThreshold ? "pending_approval" : "auto_executed";
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

// Routes every tool call through the 4-rung recovery ladder (retry -> fallback -> degrade ->
// escalate) and persists a trail_steps row per attempt, in real time, via withRecovery.
async function dispatchWithRecovery(
  decisionId: string,
  stepIndex: number,
  name: string,
  args: Record<string, unknown>,
): Promise<{ output: unknown; step: TrailStep; effectiveToolName: string }> {
  const fallbackCall =
    name === "send_reminder_email"
      ? async () => dispatchTool("send_sms_reminder", { ...args, note: "email delivery failed" })
      : undefined;

  const result = await withRecovery({
    decisionId,
    stepIndex,
    toolName: name,
    input: args,
    primaryCall: async () => dispatchTool(name, args),
    fallbackCall,
  });

  return {
    output: result.output,
    step: result.step,
    effectiveToolName: result.rungUsed === "escalated" ? "ask_human" : name,
  };
}

// Earlier decisions for the same customer, within this run, feed back into the next one — same
// intent as CLAUDE.md's promise that outcome memory changes future behaviour.
async function getPriorOutcomesText(customerId: string): Promise<string> {
  const priorOutcomes = await getOutcomesForCustomer(customerId);
  return priorOutcomes.length > 0
    ? `\n\nPrior decisions for this customer, earlier in this run:\n${priorOutcomes
        .map((d) => `- ${d.action} (status: ${d.status}, confidence: ${d.confidence})`)
        .join("\n")}`
    : "";
}

// Write a stub decision row now — trail_steps rows inserted during reasoning reference this
// decision_id via a FK, so the parent row must exist before the first tool call, not just at
// the end.
function buildStubDecision(decisionId: string, invoice: Invoice, goal: string): Decision {
  return {
    id: decisionId,
    invoiceId: invoice.id,
    customerId: invoice.customerId,
    goal,
    trail: [],
    action: "",
    reasoning: "",
    manualProcedure: [],
    confidence: 0,
    escalationReason: null,
    status: "pending_approval",
    createdAt: new Date().toISOString(),
  };
}

type TerminalTool = "ask_human" | "send_reminder_email" | "send_sms_reminder";

// Runs the multi-turn tool loop (shared by a fresh daily-scan investigation and a reply-triggered
// one) until a real terminal tool fires or the turn budget runs out. Mutates `messages` in place
// so the caller can pass the same array on to finalizeDecision.
async function runReasoningTurns(
  decisionId: string,
  invoiceId: string,
  messages: LlmMessage[],
): Promise<{ trail: TrailStep[]; terminalTool: TerminalTool }> {
  const trail: TrailStep[] = [];
  let stepIndex = 0;
  let toolTurns = 0;

  // A decision may only be finalised after a REAL terminal tool call (ask_human or
  // send_reminder_email) has been dispatched and logged — never from prose describing an
  // intended action. This is the guard against the 21 July bug: tool names written as text
  // instead of genuine function calls. Which tool fired is also what determines the final
  // status below — never the model's self-reported status alone.
  let terminalTool: TerminalTool | null = null;

  while (toolTurns < MAX_TOOL_TURNS && !terminalTool) {
    if (toolTurns > 0) await sleep(TURN_DELAY_MS);
    const response = await generateWithTools(messages, TOOLS);

    if (response.toolCalls.length === 0) {
      const fakedToolUse = TOOL_NAMES.some((name) => response.text.includes(name));
      if (fakedToolUse) {
        console.warn(
          `  [WARN] ${invoiceId}: model described an action in plain text instead of calling ` +
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
    const effectiveToolNames: string[] = [];
    for (const call of response.toolCalls) {
      stepIndex += 1;
      const result = await dispatchWithRecovery(decisionId, stepIndex, call.name, call.args);
      stepIndex = result.step.stepIndex;
      trail.push(result.step);
      toolResults.push({ name: call.name, result: result.output });
      // A reminder blocked by the dispute guard (agent/tools.ts) is real data returned to the
      // model, not a completed send — it must not count as the terminal action, or a model that
      // ignores the dispute rule would still finalize as auto_executed.
      const isBlocked =
        typeof result.output === "object" && result.output !== null && (result.output as { blocked?: boolean }).blocked === true;
      if (!isBlocked) effectiveToolNames.push(result.effectiveToolName);
    }
    messages.push({ role: "tool", toolResults });
    toolTurns += 1;

    const calledAskHuman = effectiveToolNames.includes("ask_human");
    const calledSendEmail = effectiveToolNames.includes("send_reminder_email");
    const calledSendSms = effectiveToolNames.includes("send_sms_reminder");
    if (calledAskHuman) terminalTool = "ask_human";
    else if (calledSendEmail) terminalTool = "send_reminder_email";
    else if (calledSendSms) terminalTool = "send_sms_reminder";
  }

  if (!terminalTool) {
    const escalationArgs = buildTurnBudgetEscalation(trail, invoiceId, MAX_TOOL_TURNS);
    stepIndex += 1;
    const result = await dispatchWithRecovery(decisionId, stepIndex, "ask_human", escalationArgs);
    stepIndex = result.step.stepIndex;
    trail.push(result.step);
    messages.push({ role: "tool", toolResults: [{ name: "ask_human", result: result.output }] });
    terminalTool = "ask_human";
  }

  return { trail, terminalTool };
}

async function finalizeDecision(
  decisionId: string,
  invoice: Invoice,
  goal: string,
  messages: LlmMessage[],
  trail: TrailStep[],
  terminalTool: TerminalTool,
): Promise<Decision> {
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
    escalationReason: status === "pending_approval" ? output.escalationReason || output.reasoning : null,
    status,
    createdAt: new Date().toISOString(),
  };

  // Trail rows were already persisted individually, in real time, inside dispatchWithRecovery —
  // pass an empty trail here so recordOutcome's saveDecision doesn't re-insert them.
  await recordOutcome({ ...decision, trail: [] });
  return decision;
}

async function runInvoice(invoiceId: string): Promise<Decision> {
  const invoice = seedInvoices.find((inv) => inv.id === invoiceId);
  if (!invoice) throw new Error(`Unknown seed invoice: ${invoiceId}`);

  const decisionId = randomUUID();
  const goal =
    `Decide the right collection action for invoice ${invoice.id} ` +
    `(${invoice.customerName}, Rs ${invoice.amountDue.toLocaleString()}), minimising overdue ` +
    `receivables without damaging the relationship.`;

  const priorOutcomesText = await getPriorOutcomesText(invoice.customerId);
  const messages: LlmMessage[] = [
    { role: "system", text: SYSTEM_PROMPT },
    { role: "user", text: `${goal}\nInvoice ID to investigate: ${invoice.id}${priorOutcomesText}` },
  ];

  await recordOutcome(buildStubDecision(decisionId, invoice, goal));
  const { trail, terminalTool } = await runReasoningTurns(decisionId, invoice.id, messages);
  return finalizeDecision(decisionId, invoice, goal, messages, trail, terminalTool);
}

// Trigger type 2 (inbound email reply — see CLAUDE.md "The loop"). Reuses the exact same
// reasoning core as runInvoice: the classification is passed in only as a hint inside the prompt
// text, not as a fixed tool sequence, so the agent still chooses its own tools per rule 5. Always
// produces a FRESH decision (new decisionId) rather than mutating the original one, same pattern
// as lib/silenceCheck.ts's silence-timeout escalations.
export async function runReplyDecision(
  invoice: Invoice,
  reply: { from: string; subject: string; body: string; date: string },
  classification: ReplyClassification,
): Promise<Decision> {
  const decisionId = randomUUID();
  const goal =
    `Customer ${invoice.customerName} replied regarding invoice ${invoice.id} ` +
    `(Rs ${invoice.amountDue.toLocaleString()}). The reply has been classified as ` +
    `"${classification}" — verify this via tools rather than trusting it outright. Decide the ` +
    `right next action, minimising overdue receivables without damaging the relationship.`;

  const priorOutcomesText = await getPriorOutcomesText(invoice.customerId);
  const messages: LlmMessage[] = [
    { role: "system", text: SYSTEM_PROMPT },
    {
      role: "user",
      text:
        `${goal}\nInvoice ID: ${invoice.id}\nCustomer reply (Subject: "${reply.subject}"):\n` +
        `"""\n${reply.body.trim()}\n"""${priorOutcomesText}`,
    },
  ];

  await recordOutcome(buildStubDecision(decisionId, invoice, goal));
  const { trail, terminalTool } = await runReasoningTurns(decisionId, invoice.id, messages);
  return finalizeDecision(decisionId, invoice, goal, messages, trail, terminalTool);
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
  console.log(`  Pending human approval: ${decisions.filter((d) => d.status === "pending_approval").length}`);
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
