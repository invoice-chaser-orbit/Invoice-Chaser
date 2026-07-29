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

This checkout is the reasoning core: a terminal program that runs the agent loop over five seeded
invoices and prints each decision and its full tool-call trail. There is no dashboard, no
persistence layer, and no live inbox polling yet — those are separate pieces of the same
architecture that aren't part of this code yet.

## What's live vs. simulated

Gmail is a live integration — the agent's collection reminders are sent through a real Gmail
account using OAuth-authenticated API calls, and replies can be read back from the real inbox.
The accounting, CRM, payments, and calendar/SMS tools are simulated against seeded data rather
than connected to real systems like QuickBooks or Twilio. All five tool categories are called by
the agent as genuine function calls through the same shared tool interface — the difference is
only in what happens behind that interface, not in how the agent decides to use them. Swapping a
simulated tool for a real one (e.g. QuickBooks instead of seeded invoice data) is an adapter
change, not an architecture change.

## Project structure

```
lib/
  types.ts     shared shapes: Invoice, CustomerHistory, TrailStep, Decision
  llm.ts       the only file that imports the Gemini SDK — exposes a provider-agnostic
               generateWithTools() / generateDecision() interface
data/
  seed.ts      five seeded invoices, each designed to prove one specific reasoning behaviour
  history.ts   the CRM + payment history the tools read
agent/
  tools.ts     tool definitions (JSON-schema shaped) + the dispatcher that executes them
               against the seeded data
  prompts.ts   the system prompt encoding the reasoning rules, and the confidence threshold
  memory.ts    in-memory outcome memory — past decisions in a run feed into later ones
  loop.ts      the multi-turn function-calling loop; the runnable entry point
```

## How it works

**Provider boundary.** Agent code never imports `@google/generative-ai` directly — only
`lib/llm.ts` does. Everything else calls `generateWithTools()` / `generateDecision()`, which
speak a plain, provider-agnostic message/tool shape. Swapping models or providers later is a
one-file change.

**The loop.** For each invoice, the model chooses which tools to call and in what order — it's
not a fixed sequence. Every tool call goes through Gemini's native function-calling API and is
dispatched to a real function against the seeded data (never a mocked return baked into the
prompt), and every call is logged as a `TrailStep` as it happens. A decision is only finalised
once a real terminal tool call has fired — `send_reminder_email` or `ask_human` — never from the
model describing an action in prose.

**Decision status.** `auto_executed` / `pending_approval` / `ask_human` is derived from which
terminal tool actually ran plus the confidence score, never trusted verbatim from the model's
self-reported JSON. That's a deliberate guard: a decision record should never claim an action was
taken that wasn't.

**Human-in-the-loop.** `send_reminder_email` is for pre-approved first-touch reminders only.
Anything beyond that — a payment plan, a discount, a deadline extension, a dispute response — or
a confidence score below threshold routes to `ask_human` instead. That escalation must carry what
was tried, what was found, what remains unresolved, and two or three options with a
recommendation — never a bare "I don't know."

**`manualProcedure`.** Every decision carries a numbered set of steps a finance officer would
follow to reach the same judgment without the agent. It's written to teach the reasoning, not to
log what the agent called — see `agent/prompts.ts` for the exact right/wrong examples the system
prompt uses to steer this.

## Getting started

```bash
npm install
cp .env.example .env   # then set GEMINI_API_KEY — the only variable this checkout needs
npm run agent           # runs the loop over the 5 seeded invoices, prints each decision + trail
npm run typecheck
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

## Extending it

To add a new tool: add a `ToolDefinition` to `TOOLS` in `agent/tools.ts` and a matching case in
`dispatchTool()`. Shared types (`Invoice`, `Decision`, `TrailStep`, etc.) all live in
`lib/types.ts` — it's shared across the whole project, so treat changes to it as something to
flag rather than edit silently.
