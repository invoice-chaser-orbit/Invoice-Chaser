# InvoiceChaser

An autonomous accounts-receivable collection agent. It runs a **sense → reason → act → observe**
loop over a receivables ledger, driven by a standing goal —
_"minimise overdue receivables without damaging customer relationships"_ — rather than fixed
rules. The same lateness can produce different actions for different customers: the agent reads
relationship history, payment patterns, and open deals before deciding, and it must be able to
show that branching, not just claim it.

For the original hackathon architecture contract, see `CLAUDE.md`. This README describes the
current checkout and demo workflow; the proposal document also contains earlier plans.

## What's built right now

- **Reasoning core** (`agent/loop.ts`): multi-turn Gemini function-calling loop over 30 seeded
  invoices, recording tool calls and outcomes for each run.
- **Three trigger types**, all wired to the same reasoning core:
  - Daily ledger scan (`npm run agent`)
  - Inbound Gmail reply (`npm run poll-replies`), classified via `agent/classifier.ts`
  - Payment webhook (`npm run webhook`) — simulated inbound payment event; a live payments
    adapter would call `runPaymentWebhookDecision` directly from its webhook handler instead
- **Persistence** (Supabase): decisions, trail steps, and human actions are real rows, not
  in-memory state — see `supabase/schema.sql` and `lib/decisions.ts`.
- **Dashboard** (Next.js, `app/`): Overview, Decisions, Approvals, and Executed pages, with
  search, status filters, notifications, and a Run agent panel. Decision detail has Overview,
  Audit trail, Delivery, and Teach-me tabs. Cash-flow figures are calculated from the demo
  ledger; they are not independently verified accounting metrics.
- **Human review** (`lib/executor.ts`): a routine gated reminder waits in Pending approval.
  A Needs input case must first be resolved with a customer email draft, then reviewed again in
  Pending approval before any email is sent. Approve, Edit, and Override are available;
  Redirect is not implemented.
- **Error recovery**: a 4-rung ladder (retry → fallback channel → degrade/queue → escalate),
  logging every attempt — including failures — to `trail_steps` as it happens (`agent/recovery.ts`).

## What's live vs. simulated

Gmail is a live integration — collection reminders can be sent through an OAuth-authorized Gmail
account, and replies can be read back from its inbox. All 30 demo invoices currently use the
same real test inbox recorded in `data/seed.ts`, so a run can send messages there. The sender
account still needs valid `credentials.json` and `token.json` files.
The accounting, CRM, payments, and calendar/SMS tools are simulated against seeded data
(`lib/adapters/*.ts`) rather than connected to real systems like QuickBooks or Twilio. All five
tool categories are called by the agent as genuine function calls through the same shared tool
interface — the difference is only in what happens behind that interface, not in how the agent
decides to use them. The simulated payment webhook does not read bank statements or update an
external ledger. This is a controlled demo, not a live receivables system.

## Project structure

```
lib/
  types.ts        shared shapes: Invoice, CustomerHistory, TrailStep, Decision
  llm.ts          the only file that imports the Gemini SDK — exposes a provider-agnostic
                  generateWithTools() / generateDecision() interface
  supabase.ts     Supabase client
  decisions.ts    decision + trail_steps persistence (save/get/getTrail)
  invoices.ts     invoice retrieval (Supabase, falls back to seed data)
  executor.ts     prepares or completes a human-reviewed action
  gmail.ts        Gmail send + poll (the one live external integration)
  delivery-status.ts  interprets send attempts for the Delivery tab
  toolLabels.ts   plain-language labels for trail_steps tool names (dashboard display)
  adapters/       simulated tool adapters — accounting, crm, payments, sms, calendar
data/
  seed.ts         30 demo invoices, including gated reminder cases
  history.ts      the CRM + payment history the tools read, paired 1:1 by customerId
agent/
  tools.ts        tool definitions (JSON-schema shaped) + the dispatcher that executes them
  prompts.ts      the system prompt encoding the reasoning rules, and the confidence threshold
  classifier.ts   LLM-driven reply classification (promise / dispute / partial-payment / query)
  memory.ts       outcome memory — past decisions (Supabase-backed) feed into later ones
  loop.ts         the multi-turn function-calling loop; exports one entry point per trigger type
  recovery.ts     retry, fallback, degrade, and escalation ladder
  pollReplies.ts  CLI: polls Gmail for replies, classifies, and re-enters the loop
  paymentWebhook.ts  CLI: simulates an inbound payment webhook and re-enters the loop
app/
  (dashboard)/    Next.js routes: overview, decisions, approvals, executed, decision detail
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
batched). A decision is only finalised once a terminal tool has fired —
`send_reminder_email`, `send_sms_reminder`, `request_reminder_approval`, or `ask_human` — never
from the model describing an action in prose.

**Decision status.** The terminal tool and confidence determine Auto-executed, Pending approval,
or Needs input; the UI does not trust a status claimed in the model's final JSON. A run that stops
before saving a complete recommendation appears as Incomplete run and is retried on the next
scan. Completed human actions appear as Human-approved, Human-edited, or Human-overridden in
Executed. Confidence is the model's estimate, not a measured accuracy rate.

**Human-in-the-loop.** `send_reminder_email` / `send_sms_reminder` are for pre-approved
first-touch reminders only. Anything beyond that — a payment plan, a discount, a deadline
extension, a dispute response, or a legal handoff — needs human review. Low confidence also
gates a decision; unresolved facts route to `ask_human`. That escalation must carry what was
tried, what was found, what remains
unresolved, and two or three options with a recommendation — never a bare "I don't know." Gated
decisions surface in the dashboard's approval queue. For Pending approval, Approve or Edit can
send the proposed customer email after confirmation. For Needs input, Approve, Edit, or Override
first requires a customer-facing draft and moves the case to Pending approval without sending.
A second confirmation is required to send it. Override on a Pending approval case records a
different outcome without sending a customer email. Redirect is unavailable.

**Repeat scans and failures.** The daily scan skips an invoice that already has a finished agent
decision for its current seeded state, but retries an incomplete one. If one invoice fails, the
Run agent panel reports it and the scan continues with the remaining invoices. Old decisions and
their audit trails remain available by direct link; the Decisions list shows the latest run per
invoice.

**`manualProcedure`.** Every decision carries a numbered set of steps a finance officer would
follow to reach the same judgment without the agent. It's written to teach the reasoning, not to
log what the agent called — see `agent/prompts.ts` for the exact right/wrong examples the system
prompt uses to steer this, and the dashboard's "Teach-me" tab for how it's surfaced.

## Getting started

1. Install dependencies with `npm install`. Copy `.env.example` to `.env` and set the Gemini
   and Supabase values. The app needs a reachable Supabase project with `supabase/schema.sql`
   applied. Keep credentials and tokens out of version control.
2. To use live Gmail delivery or reply polling, put OAuth `credentials.json` in the project
   root and run `npx tsx scripts/manual/gmailAuth.ts` to create `token.json`. This helper uses
   port 3000 for its callback, so finish authorization before starting the dashboard on that
   port.
3. Start the dashboard with `npm run dev`, then open `http://127.0.0.1:3000`. The sidebar's
   **Run agent** button scans the seeded ledger. `npm run agent` performs the same scan from
   the terminal. Both can send real first-touch Gmail messages for invoices whose contact does
   not require approval.
4. Optional CLI triggers: `npm run poll-replies` reads the Gmail inbox; replies from the shared
   demo address need an invoice ID in the subject to identify the case. To simulate a payment
   event, run `npm run webhook -- INV-1043 4500` (substitute an invoice ID and amount). Neither
   trigger is a background service.
5. Use `npm run typecheck` and `npm run selfcheck` to run the project's checks. To inspect the
   current Supabase demo data, run
   `npx tsx --env-file=.env scripts/manual/resetDemo.ts inspect`.

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
