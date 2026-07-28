# Graph Report - .  (2026-07-28)

## Corpus Check
- Corpus is ~16,778 words - fits in a single context window. You may not need a graph.

## Summary
- 286 nodes · 433 edges · 28 communities (18 shown, 10 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.77)
- Token cost: 110,821 input · 0 output

## Community Hubs (Navigation)
- Agent Loop Core Runtime
- Agent Loop Design Rationale
- Project Dependencies
- Tool Categories & Recovery
- Tool Dispatch & Debug Toggle
- Build Config
- LLM Provider & Classifier
- Agent Core Architecture
- Seeded Invoice Scenarios
- Core Loop & Triggers
- Error Recovery Ladder
- Simulated Tool Categories
- Mansi's Persistence & Recovery
- Human-in-the-Loop Split
- Gmail OAuth
- manualProcedure Differentiator
- Taluni's Gmail & Adapters
- Trail Steps Audit Table
- Mansandi's Dashboard
- Code Freeze Day 7
- Gmail Live Decision
- Shared Types File Rule
- B2B Impact Criterion
- Live Demo Criterion
- Day 1 Milestone
- Grand Finale
- Loyal Payer Scenario
- Team ORBIT

## God Nodes (most connected - your core abstractions)
1. `InvoiceChaser — README` - 20 edges
2. `runInvoice()` - 17 edges
3. `Day 0 Walkthrough (Markdown)` - 13 edges
4. `dispatchTool()` - 12 edges
5. `Commit 81fc24a — Add payments and calendar/SMS tools, completing all 5 tool categories` - 12 edges
6. `Day 2 Walkthrough (Markdown)` - 11 edges
7. `compilerOptions` - 10 edges
8. `data/history.ts — CRM + payment history` - 10 edges
9. `agent/prompts.ts — system prompt and confidence threshold` - 10 edges
10. `generateWithTools()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Rationale: guard main() behind an import.meta.url === entry-point check so importing loop.ts for its helpers doesn't trigger a live paid Gemini run` --rationale_for--> `main()`  [EXTRACTED]
  docs/day1-explainer.md → agent/loop.ts
- `Day 0 Walkthrough (PDF)` --semantically_similar_to--> `Day 0 Walkthrough (Markdown)`  [INFERRED] [semantically similar]
  docs/day0-explainer.pdf → docs/day0-explainer.md
- `Commit b012e17 — npm run selfcheck exercising deriveStatus/buildTurnBudgetEscalation` --references--> `deriveStatus()`  [EXTRACTED]
  docs/day2-explainer.md → agent/loop.ts
- `Commit c076a24 — Extract deriveStatus/buildTurnBudgetEscalation from loop.ts, guard main()` --references--> `deriveStatus()`  [EXTRACTED]
  docs/day1-explainer.md → agent/loop.ts
- `CONFIDENCE_THRESHOLD = 0.6 decides auto-execute vs. escalate` --rationale_for--> `deriveStatus()`  [EXTRACTED]
  docs/day0-explainer.md → agent/loop.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Five Tool Categories Behind One Adapter Interface** — claude_accounting_tool, claude_email_tool, claude_payments_tool, claude_crm_tool, claude_calendar_sms_tool [EXTRACTED 1.00]
- **Four-Rung Error Recovery Ladder** — claude_retry_rung, claude_fallback_rung, claude_degrade_gracefully_rung, claude_escalate_rung [EXTRACTED 1.00]
- **Team ORBIT Members** — claude_tharusha, claude_mansi, claude_taluni, claude_mansandi [EXTRACTED 1.00]
- **Five Tool Categories as Real Dispatched Functions** — agent_tools_get_invoice_details, agent_tools_get_customer_history, agent_tools_send_reminder_email, agent_tools_send_sms_reminder, agent_tools_get_payment_transactions, agent_tools_schedule_followup, agent_tools_ask_human [EXTRACTED 1.00]
- **Five Seeded Scenarios Proving Distinct Reasoning Behaviors** — data_seed_inv_1043, data_seed_inv_2077, data_seed_inv_3140, data_seed_inv_4002, data_seed_inv_5099 [EXTRACTED 1.00]
- **Day 0 Files Created in Commit 249d63a** — lib_types_module, lib_llm_module, data_seed_module, data_history_module, agent_tools_module, agent_prompts_module, agent_memory_module, agent_loop_module [EXTRACTED 1.00]

## Communities (28 total, 10 thin omitted)

### Community 0 - "Agent Loop Core Runtime"
Cohesion: 0.09
Nodes (34): buildTurnBudgetEscalation(), main(), printDecision(), runInvoice(), blockedEmail, blockedSms, escalation, evidence (+26 more)

### Community 1 - "Agent Loop Design Rationale"
Cohesion: 0.12
Nodes (29): agent/loop.ts — multi-turn function-calling loop, agent/memory.ts — outcome memory, ask_human tool — structured escalation (whatTried, whatFound, whatUnresolved, options, recommendation), agent/tools.ts — tool definitions + dispatcher, Commit 249d63a — Add Day 0 agent core: Gemini-backed reasoning loop, Commit 36b1de8 — Fix code-review findings: status integrity, escalation options, memory, Commit c076a24 — Extract deriveStatus/buildTurnBudgetEscalation from loop.ts, guard main(), Rationale: loop.ts detects the model writing a tool name as prose instead of calling it, and nudges a real call (+21 more)

### Community 2 - "Project Dependencies"
Cohesion: 0.07
Nodes (28): dotenv, express, @google/generative-ai, googleapis, open, dependencies, dotenv, express (+20 more)

### Community 3 - "Tool Categories & Recovery"
Cohesion: 0.11
Nodes (28): agent/classifier.ts — reply classification (unwired, Day 6 scope), deriveStatus(), dispatchWithRecovery(), agent/recovery.ts — Mansi's four-rung recovery ladder, get_invoice_details tool (Accounting), get_payment_transactions tool (Payments/Stripe-PayHere), schedule_followup tool (Calendar+SMS/Google Calendar) — autonomous housekeeping, no ask_human gate, send_reminder_email tool (Email) — gated to first-touch reminders only (+20 more)

### Community 4 - "Tool Dispatch & Debug Toggle"
Cohesion: 0.18
Nodes (13): checkForcedFailure(), shouldForceFailure(), blockIfDisputed(), dispatchTool(), TOOLS, customerHistories, DisputeEvidence, paymentTransactions (+5 more)

### Community 5 - "Build Config"
Cohesion: 0.10
Nodes (19): agent, app, data, dist, lib, .next, node_modules, compilerOptions (+11 more)

### Community 6 - "LLM Provider & Classifier"
Cohesion: 0.18
Nodes (16): classifyReply(), ReplyClassification, DECISION_SCHEMA, DecisionOutput, extractSystemText(), generateDecision(), generateWithTools(), getClient() (+8 more)

### Community 7 - "Agent Core Architecture"
Cohesion: 0.12
Nodes (16): agent/loop.ts (Multi-Turn Function-Calling Loop), agent/memory.ts (Outcome Memory), agent/prompts.ts (System Prompt), agent/tools.ts (Tool Definitions + Dispatcher), ask_human Escalation Route, Decision: Gemini Rather Than Anthropic for the Reasoning Core, lib/llm.ts Provider Abstraction (generateWithTools), Non-Negotiable Rule 4: The Agent Must Know When It Doesn't Know (+8 more)

### Community 8 - "Seeded Invoice Scenarios"
Cohesion: 0.22
Nodes (13): agent/prompts.ts — system prompt and confidence threshold, get_customer_history tool (CRM), Seeded scenario: deliberately unresolvable case that must reach ask_human, not a guess, Seeded scenario: loyal payer — lateness judged relative to the customer's own pattern, not an absolute threshold, Seeded scenario: open-renewal — CRM context (an active renewal deal) overrides aging-based urgency, Seeded scenario: promise-breaker — a broken payment promise earns firmer escalation than the same lateness alone would, Seeded scenario: short-payment reconciliation — hypothesis-chain reasoning over a partial payment instead of force-matching, data/history.ts — CRM + payment history (+5 more)

### Community 9 - "Core Loop & Triggers"
Cohesion: 0.20
Nodes (10): CLAUDE.md (Project Instructions Document), Judging Criterion: Autonomous Reasoning (25%), Trigger: Daily Ledger Scan, Day 0 (Jul 23): Hard Gate — 5 Real Reasoned Decisions Printed to Terminal, Day 6 (Jul 29): Replies Re-Enter the Loop; 20–30 Invoice Ledger; UI Presentable, Trigger: Inbound Email Reply, InvoiceChaser (Autonomous AR Collection Agent), Trigger: Payment Webhook (+2 more)

### Community 10 - "Error Recovery Ladder"
Cohesion: 0.22
Nodes (9): Judging Criterion: Technical Architecture (20%), Day 5 (Jul 28): Recovery Ladder Works and Is Demonstrable by Breaking Things Live, Rung 3: Degrade Gracefully (Queue and Mark Pending), Error Recovery Ladder (Four Rungs), Rung 4: Escalate with Structured Report, Rung 2: Fall Back to Equivalent Tool, Outcome Memory (agent/memory.ts), Rung 1: Retry with Backoff (+1 more)

### Community 11 - "Simulated Tool Categories"
Cohesion: 0.33
Nodes (6): Accounting Tool Category (QuickBooks/Xero, Simulated), Calendar + SMS Tool Category (Google Cal/Twilio/Ideamart, Simulated), CRM Tool Category (HubSpot/Zoho, Simulated), Payments Tool Category (Stripe/PayHere, Simulated), Seeded Scenario: Open-Renewal, Simulated Tools as Real Function Calls Behind Identical Adapter Interface

### Community 12 - "Mansi's Persistence & Recovery"
Cohesion: 0.40
Nodes (5): agent/classifier.ts (Reply Classification), Mansi — Persistence, Reply Classifier, Recovery Ladder Owner, Decision: Online/Supabase Rather Than Local Postgres, lib/recovery.ts (Error Recovery Ladder), lib/supabase.ts (Persistence Layer + Schema)

### Community 13 - "Human-in-the-Loop Split"
Cohesion: 0.40
Nodes (5): Autonomous Actions (Agent Executes, Human Inspects After), Judging Criterion: Human-in-the-Loop (15%), Day 3 (Jul 26): MVP — Approve in UI → Real Email Leaves → Status Updates, Gated Actions (Human Decides Before Execution), Human-in-the-Loop Split

### Community 14 - "Gmail OAuth"
Cohesion: 0.40
Nodes (3): credentials, oAuth2Client, SCOPES

### Community 15 - "manualProcedure Differentiator"
Cohesion: 0.50
Nodes (4): Day 4 (Jul 27): Teach-Me Layer — Every Decision Carries a Manual Procedure, Decision: manualProcedure Added on Day 4, manualProcedure: string[] Field (The Differentiator), Non-Negotiable Rule 3: Every Decision Carries manualProcedure

### Community 16 - "Taluni's Gmail & Adapters"
Cohesion: 0.50
Nodes (4): Decision: Gmail OAuth Pulled Forward to Day 1, Taluni — Gmail Send/Poll and Remaining Tool Adapters Owner, lib/adapters/* (Remaining Tool Adapters), lib/gmail.ts (Gmail Send + Poll)

### Community 17 - "Trail Steps Audit Table"
Cohesion: 0.67
Nodes (3): Day 2 (Jul 25): All 5 Tool Categories Callable; Trail Renders Step-by-Step, Non-Negotiable Rule 2: Every Tool Call Persists a trail_steps Row, trail_steps Audit Trail Table

## Knowledge Gaps
- **93 isolated node(s):** `ReplyClassification`, `trail`, `escalation`, `evidence`, `blockedEmail` (+88 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dispatchTool()` connect `Tool Dispatch & Debug Toggle` to `Agent Loop Core Runtime`, `Seeded Invoice Scenarios`, `Tool Categories & Recovery`, `Agent Loop Design Rationale`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `InvoiceChaser — README` connect `Agent Loop Design Rationale` to `Seeded Invoice Scenarios`, `Agent Loop Core Runtime`, `Tool Categories & Recovery`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `data/history.ts — CRM + payment history` connect `Seeded Invoice Scenarios` to `Agent Loop Core Runtime`, `Agent Loop Design Rationale`, `Tool Dispatch & Debug Toggle`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `ReplyClassification`, `trail`, `escalation` to the rest of the system?**
  _93 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Agent Loop Core Runtime` be split into smaller, more focused modules?**
  _Cohesion score 0.08603145235892692 - nodes in this community are weakly interconnected._
- **Should `Agent Loop Design Rationale` be split into smaller, more focused modules?**
  _Cohesion score 0.11822660098522167 - nodes in this community are weakly interconnected._
- **Should `Project Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._