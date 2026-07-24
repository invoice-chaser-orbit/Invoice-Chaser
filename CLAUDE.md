# PROJECT CONTEXT — InvoiceChaser / Team ORBIT / NeuroX 1.0 Phase 2

Paste this into the Claude Project's custom instructions so every new chat starts with full context.

---

## WHO

Team **ORBIT**, 4 students, Sri Lanka. Competing in **NeuroX 1.0**, a national-level buildathon organised by Hackathon Hub of NSBM / NSBM Green University, presented by **CueGrowth**.

| Member | Informal name | Owns |
|---|---|---|
| E.D.T.N. Gunarathne | Tharusha (me, the user) | Agent core: `loop.ts`, `tools.ts`, `prompts.ts`, `memory.ts`. Plus Git ownership and UI/Git mentoring for Mansandi. |
| P.A.T. Piyumika | Mansi | Backend: Supabase schema + persistence, reply classifier, error recovery ladder. Designated **second person who can explain the agent loop** in Q&A. |
| A.L.M. Pabarusiri | Taluni | Backend: Gmail adapter, remaining tool adapters, trigger/webhook layer. |
| A.N.G.T. Mansandi | Mansandi | Frontend: Next.js dashboard, approval queue, audit-trail + teach-me views. New to hackathons; paired with Tharusha. |

Seeded scenarios + demo narrative are handled by **all four** at the end (Days 6–8).

**Standing rules:** nobody edits `lib/types.ts` alone (it is the shared seam). Nightly 15-minute all-hands watching the full flow actually run.

---

## THE PROJECT

**InvoiceChaser** — an autonomous accounts-receivable collection agent for SMEs.

The problem: in most small businesses, someone's week disappears into chasing money already earned. It is manual, repetitive, and judgment-intensive at the same time — which is why rule-based reminder software fails. A blanket "PAY NOW" to your most valuable customer on day one of lateness damages a relationship worth far more than the invoice. The judgment layer (who to chase, how firmly, through which channel, when to stop and escalate) has never been automatable. Slow collections extend DSO, which is a working-capital problem — acute for Sri Lankan SMEs on thin cash buffers and expensive credit.

**Agentic loop:** sense → reason → act → observe, running continuously over the receivables ledger. Standing goal: *"minimise overdue receivables without damaging customer relationships."* Each trigger (daily ledger scan, inbound email reply, payment webhook) becomes a sub-goal. Same 21-day lateness produces different decisions for different debtors depending on relationship history, payment patterns, and open deals.

**Five tool categories** (all promised in the Phase 1 proposal, all must exist):
1. Accounting (QuickBooks/Xero) — invoices, payments, aging
2. Email (Gmail/Outlook) — outbound reminders + inbound reply parsing
3. Payments (Stripe/PayHere) — payment links, settlement webhooks
4. CRM (HubSpot/Zoho) — relationship value, contacts, open deals
5. Calendar + SMS (Google Cal / Twilio / Ideamart) — follow-ups, fallback channel

**Stack:** TypeScript, Anthropic SDK (native tool-use), Supabase/Postgres, Next.js dashboard.

**HITL split — gated vs autonomous:**
- *Gated (human decides before execution):* any escalation beyond a first reminder; any payment plan, discount, or deadline extension; any dispute response; any legal/collections handoff recommendation.
- *Autonomous (agent executes, human can inspect):* first-touch reminders on pre-approved tone, payment reconciliation and receipts, CRM/ledger housekeeping, scheduling its own follow-ups.
- Human powers in the queue: **approve / edit / redirect / override**. Nothing gated executes before a decision. Human decisions feed back into agent memory.

**Error recovery ladder (4 rungs):** retry with backoff → fall back to equivalent tool (SMS if email bounces, cached ledger if accounting is down) → degrade gracefully (queue and mark pending, never drop) → escalate with a structured report. Failures are logged as rigorously as successes; the audit trail has no holes.

---

## THE RULES THAT DECIDE THIS

**HARD RULE: any deviation from the Phase 1 proposal = immediate disqualification.** This is the only rule with no recovery path. All architectural promises above are locked. New work must fit *inside* them.

From the 22 July 2026 briefing (Anton + **Shamal De Silva**, CTO/co-founder of CueGrowth, on the judging panel):

- **MVP is sufficient**, full completion not expected. But ORBIT qualified **15th of 15** teams (from 81), so the goal is to win outright, not to scrape through.
- **Shamal's core thesis:** agents must be *explainable to a human*. The operator must be able to **LEARN the process by watching the agent work and replicate it without the agent**. He explicitly does NOT want agents that call a bunch of backend APIs and return results the operator cannot account for.
- **HITL is about DECISION POINTS, not a percentage of human involvement.** The agent should recognise when it lacks context or confidence and proactively reach out with a **structured message: what it already tried + proposed options**. Never a bare "I don't know."
- **Judges must trace every decision without reading source code.** Black-box autonomy is disallowed.
- **Fake/generated demo footage is heavily penalised.** A recorded backup of the *real* working product is explicitly permitted.
- **Explain the domain in the first minutes** so judges don't get stuck in a question loop about receivables instead of assessing the agent.
- **"Did an AI write this?" is coming.** AI coding assistants are allowed; code the team cannot explain scores badly.
- Not allowed: agent-as-a-service platforms, no-code AI builders, vendor agents submitted as your own, anything where you cannot explain how the autonomy is implemented.

**Judging weights:** B2B Impact & Viability 25% · Autonomous Reasoning 25% · Technical Architecture 20% · Human-in-the-Loop 15% · Live Demo 15%.

**Grand finale: 31 July 2026**, physical event, live demo before judges.

---

## THE DIFFERENTIATOR — our one bet

Every team will build an agent that calls APIs and shows results on a dashboard. That is exactly the pattern Shamal named as the problem.

Our answer: **every decision renders as a teachable procedure, not just a result.** A `manualProcedure: string[]` field on the decision output.

Not: *"Sent firm notice to Lanka Hardware."*

But:
> I checked the aging report → invoice #1043, 21 days overdue.
> I checked their payment history → they have paid 10–15 days late for eight years. For this customer that is normal, not a warning sign.
> I checked the CRM → Rs. 2.4M annual account, renewal open in six weeks.
> **Therefore:** a firm notice risks a renewal worth far more than this invoice. Sending a warm nudge instead.
> **If you were doing this manually:** open the aging report, cross-check the customer's payment pattern against their own history rather than a fixed threshold, then check for open deals before choosing tone.

A finance officer who watches five of these has *learned the collections judgment process*. That is Shamal's thesis delivered in our domain.

**Not a deviation:** the Phase 1 proposal already promises every proposed action arrives with the agent's reasoning attached — what it observed, what it inferred, why this action over alternatives — so approval is informed rather than rubber-stamp. This delivers that promise more completely.

---

## CONFIRMED DECISIONS

- **Online/cloud, Supabase** — not offline. Components are interconnected; offline would harness less of the capability.
- **Gmail is LIVE.** Accounting, CRM, payments, calendar/SMS are **simulated behind the same tool interface** — real function calls the agent chooses and executes, reading seeded data. Disclosed honestly and unprompted to judges: *"swapping in QuickBooks is an adapter change, not an architecture change."*
- **Gmail OAuth pulled forward to Day 1** (three days before needed) to de-risk.
- **Hard code freeze 6pm Day 7 (30 July).** Only crash fixes after.
- **Record a real clean run on Day 7** as network-failure backup. Never presented as live.
- **Phone hotspot as primary connectivity** at the venue, venue wifi as backup, both tested before presenting.

---

## CODEBASE STATE

Written and type-checking clean, but **as of 23 July nothing had ever been executed** — no real API call had been made. Day 0 is the gate for that.

| File | Purpose |
|---|---|
| `lib/types.ts` | Shared Decision/Invoice types. Single source of truth. |
| `data/seed.ts` | 5 invoice "personalities": loyal payer, promise-breaker, open-renewal, reconciliation short-payment (Rs. 95,500 paid against Rs. 100,000), low-confidence case. |
| `data/history.ts` | CRM + payment history the tools read from. |
| `agent/prompts.ts` | System prompt — the reasoning instructions. |
| `agent/tools.ts` | 3 real callable tools via Anthropic native tool-use: `lookup_accounting`, `lookup_crm`, `check_payment_history` + dispatcher. |
| `agent/memory.ts` | Outcome memory so past decisions inform future ones ("adapt dynamically"). |
| `agent/loop.ts` | Multi-turn tool-calling while-loop, captures `TrailStep[]` = the transparent decision trail. |

**Not yet built:** Supabase persistence, Gmail adapter, Next.js dashboard, approval queue UI, audit-trail page, error recovery ladder, teach-me layer, reply classifier, remaining 2 tool categories.

**Key past lesson:** an LLM that writes tool *names* as text is NOT multi-tool integration. Judges will ask to see real tool-use logs. This bug was found and fixed on 21 July.

---

## 8-DAY PLAN

| Day | Date | Theme | Ends with |
|---|---|---|---|
| **0** | Jul 23 | Ignition — **HARD GATE** | 5 real reasoned decisions printed to terminal, watched by all four. Nothing else starts until this works. |
| **1** | Jul 24 | Persistence + skeleton | Decisions survive in Supabase; ugly webpage displays them. Gmail OAuth done. |
| **2** | Jul 25 | Five tools + visible trail | All 5 tool categories callable; trail renders step-by-step in browser. |
| **3** | Jul 26 | Email out + human gate | **MVP CHECKPOINT.** Approve in UI → real email leaves → status updates. |
| **4** | Jul 27 | The teach-me layer | Every decision carries a manual procedure. **The bet lands.** |
| **5** | Jul 28 | Failure day, on purpose | Recovery ladder works and is demonstrable by breaking things live. |
| **6** | Jul 29 | Replies + scale + polish | Inbound replies re-enter the loop; 20–30 invoice ledger; UI presentable. |
| **7** | Jul 30 | Freeze and rehearse | Code frozen 6pm. Three clean end-to-end runs. Backup recorded. |
| **8** | Jul 31 | **GRAND FINALE** | Present. |

Full day-by-day task breakdown per person is in `ORBIT_Phase2_WorkBreakdown.pdf`.

---

## DEMO RUN-OF-SHOW (~6 min, built Day 7)

1. Frame the domain in under a minute. State plainly: nothing is pre-recorded, everything is live.
2. Run the ledger scan live.
3. Two contrasting decisions side by side — same lateness, different outcome, different tool sets used.
4. **The teach-me panel — linger here.** This is the differentiator.
5. The reconciliation trail (Rs. 95,500 case) — goal → tool → output → tool → output → decision.
6. Break a tool deliberately, show retry → fallback → escalate.
7. Approve in the queue, real email arrives.
8. Close on impact numbers (DSO, cash recovered, hours saved).

**Five Q&A questions certain to come** — each person must answer aloud until fluent:
1. What makes it autonomous? → receives a goal not a command; each invoice becomes a sub-goal it plans against itself.
2. Walk the loop step by step — what triggers the next action? → three trigger types; sense/reason/act/observe; outcome feeds the next decision for that customer.
3. How does it choose tools? → not a fixed sequence; show two cases with different tool sets.
4. How does it recover from failures? → four rungs; then break something live rather than describing it.
5. Did you write this or did an AI? → Claude used as coding assistant (explicitly permitted); the loop, prompts and architecture decisions are ours; each of us can walk our own files. *Then actually be able to do it.*

---

## HOW I WANT CLAUDE TO WORK WITH ME

- Be direct about gaps and risks rather than reassuring. The 21 July catch (tool names as text ≠ tool use) was worth more than any encouragement.
- Check new work against the Phase 1 proposal before suggesting it — deviation is disqualifying.
- Check new work against Shamal's explainability thesis — that is where the marks are.
- Prefer working code over more documentation.
- I prefer downloadable formatted outputs (PDF/docx/markdown) for anything the team needs to share.
