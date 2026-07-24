# InvoiceChaser — Team ORBIT

Autonomous accounts-receivable collection agent for SMEs. Built for NeuroX 1.0 Phase 2 (buildathon by Hackathon Hub NSBM, presented by CueGrowth). Grand finale 31 July 2026 — physical event, live demo before judges.

---

## THE ONE RULE

**Any deviation from the Phase 1 proposal = immediate disqualification.** No recovery path.

Everything under "Locked Architecture" below is a commitment made in the proposal. Do not remove, rename, or restructure any of it. New capability must fit *inside* these promises, not alongside them.

Before merging anything, ask: does this add a capability we never promised, remove one we did, or change the human-in-the-loop split? If yes, stop.

---

## LOCKED ARCHITECTURE

### The loop
`sense → reason → act → observe`, running continuously over the receivables ledger.

Standing goal: *"minimise overdue receivables without damaging customer relationships."*

The agent receives a **goal, not a command**. Each trigger becomes a sub-goal it plans against itself. Three trigger types:
1. Daily ledger scan
2. Inbound email reply
3. Payment webhook

Same lateness must produce **different decisions for different debtors** based on relationship history, payment patterns, and open deals. This branching is the core of the Autonomous Reasoning score (25%) — it must be visible, not claimed.

### Five tool categories — all must exist
| Category | Real-world binding | Status in build |
|---|---|---|
| Accounting | QuickBooks / Xero | Simulated (seeded data) |
| Email | Gmail / Outlook | **LIVE** |
| Payments | Stripe / PayHere | Simulated |
| CRM | HubSpot / Zoho | Simulated |
| Calendar + SMS | Google Cal / Twilio / Ideamart | Simulated |

Simulated tools are **real function calls the agent chooses and executes** against seeded data — not hardcoded branches, not mocked returns inside the prompt. Every simulated adapter sits behind the identical interface as the live one, so swapping in QuickBooks is an adapter change, not an architecture change. We say this to judges plainly and unprompted.

### Human-in-the-loop split
**Gated — human decides before execution:**
- Any escalation beyond a first reminder
- Any payment plan, discount, or deadline extension
- Any dispute response
- Any legal / collections handoff recommendation

**Autonomous — agent executes, human can inspect after:**
- First-touch reminders on pre-approved tone
- Payment reconciliation and receipts
- CRM / ledger housekeeping
- Scheduling its own follow-ups

Human powers in the queue: **approve / edit / redirect / override**. Nothing gated executes before a human decides. Every human decision writes back to agent memory.

### Error recovery ladder — four rungs
1. **Retry** with backoff
2. **Fall back** to an equivalent tool (SMS when email bounces; cached ledger when accounting is unreachable)
3. **Degrade gracefully** — queue and mark pending, never silently drop
4. **Escalate** with a structured report

Failures log to `trail_steps` with the same rigour as successes. The audit trail has no holes — judges may check.

---

## STACK

- **TypeScript** throughout
- **Google Gemini API** (`@google/generative-ai`) — LLM reasoning core, native function calling
- **Supabase / Postgres** — decisions, trail steps, outcome memory
- **Next.js** — dashboard, approval queue, audit trail, teach-me views
- **Gmail API** — the one live external integration

### Provider abstraction — important
The model provider sits behind `lib/llm.ts`, which exposes a provider-agnostic interface (`generateWithTools(messages, tools)` returning a normalised response). Agent code in `agent/` must **never** import the Gemini SDK directly.

Two reasons this matters:
1. The proposal describes an *LLM reasoning core*, not a specific vendor. Keeping the provider behind an interface means the architecture is unchanged regardless of which model runs — a defensible position if a judge asks.
2. If Gemini rate-limits or degrades during the build week, swapping providers is a one-file change rather than a rewrite of the loop.

If `lib/llm.ts` does not exist yet, create it before writing any provider-specific code.

---

## FILE OWNERSHIP

| Path | Owner | Purpose |
|---|---|---|
| `lib/types.ts` | **shared — see rule below** | `Decision`, `Invoice`, `TrailStep`. Single source of truth. |
| `lib/llm.ts` | Tharusha | Provider abstraction over Gemini. |
| `data/seed.ts` | Tharusha | 5 invoice personalities. |
| `data/history.ts` | Tharusha | CRM + payment history the tools read. |
| `agent/prompts.ts` | Tharusha | System prompt — the reasoning instructions. |
| `agent/tools.ts` | Tharusha | Tool definitions + dispatcher. |
| `agent/memory.ts` | Tharusha | Outcome memory. |
| `agent/loop.ts` | Tharusha | Multi-turn function-calling loop, captures `TrailStep[]`. |
| `lib/supabase.ts`, schema | Mansi | Persistence layer. |
| `agent/classifier.ts` | Mansi | Reply classification. |
| `lib/recovery.ts` | Mansi | Error recovery ladder. |
| `lib/gmail.ts` | Taluni | Gmail send + poll. |
| `lib/adapters/*` | Taluni | Remaining tool adapters. |
| `app/**` | Mansandi | Next.js dashboard, approval queue, audit trail, teach-me panel. |

**Rule: nobody edits `lib/types.ts` alone.** It is the seam every file shares. Any change gets a two-minute group heads-up first. If a task requires changing it, say so explicitly rather than editing silently.

---

## NON-NEGOTIABLE IMPLEMENTATION RULES

**1. Real function calling only.**
An LLM that writes tool *names as text* in its output is not tool use. It must go through Gemini's native function-calling API, return structured `functionCall` parts, and have those dispatched to real functions whose real return values feed back into the next turn. This exact bug shipped once on 21 July and was caught late. Judges will ask to see tool-use logs.

**2. Every tool call persists a `trail_steps` row.**
As it happens, not batched at the end. One row per call: decision ID, step index, tool name, input, output, timestamp. This table *is* the audit trail the judges click through. Failed calls are logged too.

**3. Every decision carries `manualProcedure: string[]`.**
This is the project's differentiator. It is the numbered steps a finance officer would follow to reach this same decision **without the agent**. It must read like a colleague teaching you the judgment, not like a log of what happened.

Wrong: *"Called lookup_crm. Called check_payment_history. Sent email."*

Right: *"Open the aging report and find invoices past terms. Before choosing a tone, cross-check this customer's payment pattern against their own history rather than a fixed threshold — some customers are habitually 10 days late and that is normal for them. Then check the CRM for open deals, because a firm notice on a renewal worth more than the invoice costs you more than it collects."*

The rationale: the sponsor's stated thesis is that a human operator must be able to **learn the process by watching the agent and replicate it without the agent**. He explicitly does not want agents that call backend APIs and return results the operator cannot account for. This field is our answer. If a change would weaken or bypass it, don't.

**4. The agent must know when it doesn't know.**
Below the confidence threshold, route to `ask_human` rather than guessing. The escalation message is **structured**: what I tried, what I found, what I could not resolve, two or three proposed options, and a recommendation. Never a bare "I don't know."

**5. Tool selection is not a fixed sequence.**
The agent chooses which tools to call per case. A routine reminder might touch two; the reconciliation case should touch four. We demo two cases side by side with different tool sets — if the sequence is hardcoded, that demo dies.

---

## SEEDED SCENARIOS — what each must prove

Do not edit these into blandness. Each exists to demonstrate one specific behaviour under judging.

1. **Loyal payer** — habitually 10–15 days late over years, large account, renewal open. Proves: the agent reads *pattern relative to the customer*, not an absolute threshold, and softens tone to protect relationship value.
2. **Promise-breaker** — previously promised a date and missed it. Proves: outcome memory changes future behaviour; escalation is earned, not scheduled.
3. **Open-renewal** — contract renewal imminent. Proves: CRM context overrides aging-based urgency.
4. **Reconciliation short-payment** — Rs. 95,500 received against Rs. 100,000. Proves: hypothesis chain (bank fee? partial payment? withholding tax?), each checked against data, and *asks* rather than force-matching when confidence stays low. Strongest single reasoning demo — must run perfectly every time.
5. **Low-confidence case** — deliberately ambiguous. Proves: rule 4 above. Must reach `ask_human`.

---

## COMMANDS

```bash
npx tsx agent/loop.ts     # run the agent — the core smoke test
npx tsc --noEmit          # typecheck
npm run dev               # Next.js dashboard
```

Environment variables (see `.env.example`):
```
GEMINI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GMAIL_USER=
```

Never commit `.env`, `credentials.json`, or `token.json`.

---

## SCHEDULE

| Day | Date | Ends with |
|---|---|---|
| 0 | Jul 23 | **HARD GATE** — 5 real reasoned decisions printed to terminal, watched by all four. |
| 1 | Jul 24 | Decisions persist in Supabase; ugly page displays them. Gmail OAuth done. |
| 2 | Jul 25 | All 5 tool categories callable; trail renders step-by-step in browser. |
| 3 | Jul 26 | **MVP** — approve in UI → real email leaves → status updates. |
| 4 | Jul 27 | Teach-me layer. Every decision carries a manual procedure. |
| 5 | Jul 28 | Recovery ladder works and is demonstrable by breaking things live. |
| 6 | Jul 29 | Replies re-enter the loop; 20–30 invoice ledger; UI presentable. |
| 7 | Jul 30 | **Code freeze 6pm.** Three clean end-to-end runs. Real backup recorded. |
| 8 | Jul 31 | Grand finale. |

After the Day 7 freeze: crash fixes only. No features.

---

## JUDGING WEIGHTS — where effort pays

- **25% B2B Impact & Viability** — seeded scenarios that read like a real receivables story
- **25% Autonomous Reasoning** — visible branching, real multi-turn tool use
- **20% Technical Architecture** — five tools behind one interface, clean separation, working recovery
- **15% Human-in-the-Loop** — identified decision points, structured escalations
- **15% Live Demo** — nothing crashes, everything visible

Also scored implicitly: **can the team explain the code?** AI coding assistants are permitted, but code nobody can walk through scores badly. Every file has a named owner above who must be able to explain it under questioning.

---

## DECISIONS AND WHY

Written down so the reasoning survives, and so anyone can answer "why did you build it this way" without reconstructing it.

- **Online / Supabase rather than local Postgres.** Components are interconnected; an offline build would harness less of the capability. Mitigated by a phone hotspot as primary connectivity at the venue and a recorded real run as fallback.
- **Gemini rather than Anthropic for the reasoning core.** Access and cost. Kept behind `lib/llm.ts` so the architecture described in the proposal — an LLM reasoning core with native tool use — is unchanged.
- **Gmail live, other four simulated.** One genuinely live integration proves the pattern; four fragile OAuth integrations would risk the demo. Disclosed openly to judges rather than hidden.
- **Gmail OAuth pulled forward to Day 1**, three days before it is needed, because Google's consent screen setup eats time unpredictably.
- **`manualProcedure` added on Day 4.** Costs half a day, directly answers the sponsor's stated thesis, and sits inside the proposal's existing promise that reasoning is attached to every action so approval is informed rather than rubber-stamp. Not a deviation.
- **Hard code freeze 6pm Day 7.** A feature added the night before a demo is the most common way hackathon teams lose on stage.