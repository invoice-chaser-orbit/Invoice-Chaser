# InvoiceChaser

An autonomous accounts-receivable collection agent. It runs a **sense → reason → act → observe**
loop over a receivables ledger, driven by a standing goal —
*"minimise overdue receivables without damaging customer relationships"* — rather than fixed
rules. The same lateness can produce different actions for different customers: the agent reads
relationship history, payment patterns, and open deals before deciding, and it must be able to
show that branching, not just claim it.

For the full architecture contract (what's locked, what's gated vs. autonomous, the five tool
categories, the error-recovery ladder) see `CLAUDE.md`. This document is a practical, standalone
guide to what's actually built in this checkout and how to run it.

## What's built right now

- **Reasoning core** (`agent/loop.ts`): multi-turn Gemini function-calling loop over a seeded
  invoice ledger, capturing a full `TrailStep[]` per decision.
- **Three trigger types**, all wired to the same reasoning core:
  - Daily ledger scan (`npm run agent`)
  - Inbound Gmail reply (`npm run poll-replies`), classified via `agent/classifier.ts`
  - Payment webhook (`npm run webhook`) — simulated inbound payment event; a live payments
    adapter would call `runPaymentWebhookDecision` directly from its webhook handler instead
- **Persistence** (Supabase): decisions, trail steps, and human actions are real rows, not
  in-memory state — see `supabase/schema.sql` and `lib/decisions.ts`.
- **Dashboard** (Next.js, `app/`): overview KPIs (including real DSO and amount-recovered
  figures computed from the ledger), an approval queue with an inline audit-trail summary per
  item, and a decision-detail page with Overview / Audit trail / Teach-me tabs.
- **Human-in-the-loop**: gated decisions land in the approval queue; approve/edit/redirect/
  override all write back to outcome memory and, on approval, send a real email via Gmail
  (`lib/executor.ts`).
- **Error recovery**: a 4-rung ladder (retry → fallback channel → degrade/queue → escalate),
  logging every attempt — including failures — to `trail_steps` as it happens (`agent/recovery.ts`).

## What's live vs. simulated

Gmail is a live integration — the agent's collection reminders are sent through a real Gmail
account using OAuth-authenticated API calls, and replies can be read back from the real inbox.
The accounting, CRM, payments, and calendar/SMS tools are simulated against seeded data
(`lib/adapters/*.ts`) rather than connected to real systems like QuickBooks or Twilio. All five
tool categories are called by the agent as genuine function calls through the same shared tool
interface — the difference is only in what happens behind that interface, not in how the agent
decides to use them. Swapping a simulated tool for a real one (e.g. QuickBooks instead of seeded
invoice data) is an adapter change, not an architecture change.

## Project structure

```
lib/
  types.ts        shared shapes: Invoice, CustomerHistory, TrailStep, Decision
  llm.ts          the only file that imports the Gemini SDK — exposes a provider-agnostic
                  generateWithTools() / generateDecision() interface
  supabase.ts     Supabase client
  decisions.ts    decision + trail_steps persistence (save/get/getTrail)
  invoices.ts     invoice retrieval (Supabase, falls back to seed data)
  executor.ts     executes a human's approve/edit/redirect/override action
  gmail.ts        Gmail send + poll (the one live external integration)
  recovery.ts     4-rung error recovery ladder
  toolLabels.ts   plain-language labels for trail_steps tool names (dashboard display)
  adapters/       simulated tool adapters — accounting, crm, payments, sms, calendar
data/
  seed.ts         seeded invoices: 5 locked scenarios (do not edit) + ledger padding
  history.ts      the CRM + payment history the tools read, paired 1:1 by customerId
agent/
  tools.ts        tool definitions (JSON-schema shaped) + the dispatcher that executes them
  prompts.ts      the system prompt encoding the reasoning rules, and the confidence threshold
  classifier.ts   LLM-driven reply classification (promise / dispute / partial-payment / query)
  memory.ts       outcome memory — past decisions (Supabase-backed) feed into later ones
  loop.ts         the multi-turn function-calling loop; exports one entry point per trigger type
  pollReplies.ts  CLI: polls Gmail for replies, classifies, and re-enters the loop
  paymentWebhook.ts  CLI: simulates an inbound payment webhook and re-enters the loop
app/
  (dashboard)/    Next.js routes: overview, approvals, decisions, decision detail
components/
  dashboard/      dashboard UI: overview panel, approvals queue, decision detail tabs
```

## How it works

**Provider boundary.** Agent code never imports `@google/generative-ai` directly — only
`lib/llm.ts` does. Everything else calls `generateWithTools()` / `generateDecision()`, which
speak a plain, provider-agnostic message/tool shape. Swapping models or providers later is a
one-file change.

**The loop.** For each invoice, the model chooses which tools to call and in what order — it's
not a fixed sequence. Every tool call goes through Gemini's native function-calling API and is
dispatched to a real function against the seeded data (never a mocked return baked into the
prompt), and every call is logged as a `TrailStep` (persisted to `trail_steps` in real time, not
batched). A decision is only finalised once a real terminal tool call has fired —
`send_reminder_email`, `send_sms_reminder`, or `ask_human` — never from the model describing an
action in prose.

**Decision status.** `auto_executed` / `pending_approval` / `ask_human` is derived from which
terminal tool actually ran plus the confidence score, never trusted verbatim from the model's
self-reported JSON. That's a deliberate guard: a decision record should never claim an action was
taken that wasn't.

**Human-in-the-loop.** `send_reminder_email` / `send_sms_reminder` are for pre-approved
first-touch reminders only. Anything beyond that — a payment plan, a discount, a deadline
extension, a dispute response, a legal handoff — or a confidence score below threshold routes to
`ask_human` instead. That escalation must carry what was tried, what was found, what remains
unresolved, and two or three options with a recommendation — never a bare "I don't know." Gated
decisions surface in the dashboard's approval queue; approve/edit/redirect/override all write
back to outcome memory via `lib/executor.ts`, and an approval sends a real email.

**`manualProcedure`.** Every decision carries a numbered set of steps a finance officer would
follow to reach the same judgment without the agent. It's written to teach the reasoning, not to
log what the agent called — see `agent/prompts.ts` for the exact right/wrong examples the system
prompt uses to steer this, and the dashboard's "Teach-me" tab for how it's surfaced.

## Getting started

```bash
npm install
cp .env.example .env   # then set GEMINI_API_KEY, Supabase and Gmail vars — see .env.example
npm run agent           # daily-scan trigger: runs the loop over the seeded ledger
npm run poll-replies     # inbound-reply trigger: polls Gmail and re-enters the loop
npm run webhook -- <invoiceId> <amountReceived>   # payment-webhook trigger, simulated
npm run dev              # Next.js dashboard
npm run typecheck
npm run selfcheck
```

## Technical considerations

These aren't obvious from a casual read of the code — they're the reasons behind some
non-standard-looking choices in `lib/llm.ts` and `agent/loop.ts`.

- **Model is pinned**, not picked from a default. `lib/llm.ts` hardcodes the model name because
  it's the one verified live, with function calling, against this project's API key — other
  candidate model names were either unavailable or too rate-limited for iteration. Check that
  comment before changing it.
- **There's a deliberate delay between turns** in `agent/loop.ts`. It's there because the API
  tier this project runs on has a low requests-per-minute ceiling — removing the delay will fail
  the run on quota, not on logic.
- **`thoughtSignature` must be echoed back verbatim** on the next turn's function-call part, or
  multi-turn tool use degrades. This is handled inside `lib/llm.ts`; don't strip it if you're
  touching the message-building code.
- **This SDK build rejects the `"function"` role** for function responses ("Role 'function' is
  not supported"). Function results are sent under `"user"` instead — also in `lib/llm.ts`.
- **The loop actively detects fake tool use.** If the model writes a tool name as plain text
  instead of making a real function call, the loop catches it and nudges the model to take a real
  action instead. Real tool use is a hard requirement here, not a nice-to-have — a model that
  narrates an action instead of calling it must not be allowed to pass as having taken it.
- **The classifier's live self-check is opt-in** (`RUN_LIVE_CLASSIFIER_CHECK=1 npm run selfcheck`)
  — it makes a real Gemini call per sample, so it's excluded from the default chain to avoid
  spending API quota on every run.

## Extending it

To add a new tool: add a `ToolDefinition` to `TOOLS` in `agent/tools.ts`, a matching case in
`dispatchTool()`, and (if it's a new category) a new file under `lib/adapters/`. Shared types
(`Invoice`, `Decision`, `TrailStep`, etc.) all live in `lib/types.ts` — it's shared across the
whole project, so treat changes to it as something to flag rather than edit silently.
