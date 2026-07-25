# Graph Report - E:/Invoice-Chaser  (2026-07-25)

## Corpus Check
- Corpus is ~6,179 words - fits in a single context window. You may not need a graph.

## Summary
- 205 nodes · 265 edges · 20 communities (14 shown, 6 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.92)
- Token cost: 0 input · 110,679 output

## Community Hubs (Navigation)
- Agent Loop Runtime
- Locked Architecture & Judging Criteria
- Provider Switch & Freeze Rehearsal
- Project Config & Directory Structure
- Recovery Ladder & Persistence
- Package Dependencies
- LLM Provider Abstraction
- Human-in-the-Loop Dashboard
- Agent Core File Ownership
- Teach-Me Differentiator
- Gmail & Tool Adapters
- Simulated Tool Categories
- Trail Steps Audit Table
- lib/types.ts Shared Ownership Rule
- Day 1 Milestone
- Day 8 Grand Finale
- Gmail Live Decision
- Loyal Payer Scenario
- Team ORBIT
- Competition Qualification Result

## God Nodes (most connected - your core abstractions)
1. `Section 7: Risk Register` - 12 edges
2. `compilerOptions` - 10 edges
3. `runInvoice()` - 9 edges
4. `Sense → Reason → Act → Observe Loop` - 8 edges
5. `Tharusha — Agent Core Owner (loop.ts, tools.ts, prompts.ts, memory.ts, llm.ts, seed.ts, history.ts)` - 8 edges
6. `generateWithTools()` - 7 edges
7. `generateDecision()` - 7 edges
8. `Tharusha (E.D.T.N. Gunarathne) — Agent Core Owner, Git Owner, UI Mentor` - 7 edges
9. `Error Recovery Ladder (Four Rungs)` - 6 edges
10. `app/** (Next.js Dashboard, Approval Queue, Audit Trail, Teach-Me Panel)` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Judging Weights Table` --semantically_similar_to--> `Judging Criterion: Human-in-the-Loop (15%)`  [INFERRED] [semantically similar]
  workplan.pdf → CLAUDE.md
- `Judging Weights Table` --semantically_similar_to--> `Judging Criterion: B2B Impact & Viability (25%)`  [INFERRED] [semantically similar]
  workplan.pdf → CLAUDE.md
- `Judging Weights Table` --semantically_similar_to--> `Judging Criterion: Autonomous Reasoning (25%)`  [INFERRED] [semantically similar]
  workplan.pdf → CLAUDE.md
- `Judging Weights Table` --semantically_similar_to--> `Judging Criterion: Technical Architecture (20%)`  [INFERRED] [semantically similar]
  workplan.pdf → CLAUDE.md
- `Judging Weights Table` --semantically_similar_to--> `Judging Criterion: Live Demo (15%)`  [INFERRED] [semantically similar]
  workplan.pdf → CLAUDE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Five Tool Categories Behind One Adapter Interface** — claude_accounting_tool, claude_email_tool, claude_payments_tool, claude_crm_tool, claude_calendar_sms_tool [EXTRACTED 1.00]
- **Four-Rung Error Recovery Ladder** — claude_retry_rung, claude_fallback_rung, claude_degrade_gracefully_rung, claude_escalate_rung [EXTRACTED 1.00]
- **Team ORBIT Members** — claude_tharusha, claude_mansi, claude_taluni, claude_mansandi [EXTRACTED 1.00]

## Communities (20 total, 6 thin omitted)

### Community 0 - "Agent Loop Runtime"
Cohesion: 0.13
Nodes (22): main(), printDecision(), runInvoice(), sleep(), TOOL_NAMES, getOutcomesForCustomer(), outcomesByCustomer, recordOutcome() (+14 more)

### Community 1 - "Locked Architecture & Judging Criteria"
Cohesion: 0.09
Nodes (24): ask_human Escalation Route, CLAUDE.md (Project Instructions Document), Judging Criterion: Autonomous Reasoning (25%), Judging Criterion: B2B Impact & Viability (25%), Judging Criterion: Live Demo (15%), Judging Criterion: Technical Architecture (20%), Trigger: Daily Ledger Scan, Day 0 (Jul 23): Hard Gate — 5 Real Reasoned Decisions Printed to Terminal (+16 more)

### Community 2 - "Provider Switch & Freeze Rehearsal"
Cohesion: 0.11
Nodes (20): Decision: Hard Code Freeze 6pm Day 7, Day 7 (Jul 30): Code Freeze 6pm; Three Clean End-to-End Runs; Real Backup Recorded, Decision: Gemini Rather Than Anthropic for the Reasoning Core, lib/llm.ts Provider Abstraction (generateWithTools), lib/llm.ts (Provider Abstraction over Gemini), Day 7: Freeze and Rehearse — Code Freeze 6pm, Three Runs, Backup Recorded, Demo Run-of-Show (Six-Minute Suggested Shape), Decision: Provider Change Anthropic → Google Gemini (Cost Grounds) (+12 more)

### Community 3 - "Project Config & Directory Structure"
Cohesion: 0.10
Nodes (19): agent, app, data, dist, lib, .next, node_modules, compilerOptions (+11 more)

### Community 4 - "Recovery Ladder & Persistence"
Cohesion: 0.13
Nodes (18): agent/classifier.ts (Reply Classification), Day 5 (Jul 28): Recovery Ladder Works and Is Demonstrable by Breaking Things Live, Rung 3: Degrade Gracefully (Queue and Mark Pending), Error Recovery Ladder (Four Rungs), Rung 4: Escalate with Structured Report, Rung 2: Fall Back to Equivalent Tool, Mansi — Persistence, Reply Classifier, Recovery Ladder Owner, Outcome Memory (agent/memory.ts) (+10 more)

### Community 5 - "Package Dependencies"
Cohesion: 0.11
Nodes (17): @google/generative-ai, dependencies, @google/generative-ai, devDependencies, tsx, @types/node, typescript, name (+9 more)

### Community 6 - "LLM Provider Abstraction"
Cohesion: 0.23
Nodes (13): DECISION_SCHEMA, DecisionOutput, extractSystemText(), generateDecision(), generateWithTools(), getClient(), JsonSchemaType, LlmMessage (+5 more)

### Community 7 - "Human-in-the-Loop Dashboard"
Cohesion: 0.23
Nodes (12): app/** (Next.js Dashboard, Approval Queue, Audit Trail, Teach-Me Panel), Autonomous Actions (Agent Executes, Human Inspects After), Judging Criterion: Human-in-the-Loop (15%), Day 3 (Jul 26): MVP — Approve in UI → Real Email Leaves → Status Updates, Gated Actions (Human Decides Before Execution), Human-in-the-Loop Split, Mansandi — Next.js Dashboard, Approval Queue, Audit Trail, Teach-Me Panel Owner, Approval Queue (Approve / Edit / Redirect / Override) (+4 more)

### Community 8 - "Agent Core File Ownership"
Cohesion: 0.29
Nodes (10): agent/loop.ts (Multi-Turn Function-Calling Loop), agent/memory.ts (Outcome Memory), agent/prompts.ts (System Prompt), agent/tools.ts (Tool Definitions + Dispatcher), Non-Negotiable Rule 1: Real Function Calling Only, Tharusha — Agent Core Owner (loop.ts, tools.ts, prompts.ts, memory.ts, llm.ts, seed.ts, history.ts), data/history.ts (CRM + Payment History), data/seed.ts (5 Invoice Personalities) (+2 more)

### Community 9 - "Teach-Me Differentiator"
Cohesion: 0.28
Nodes (9): Day 4 (Jul 27): Teach-Me Layer — Every Decision Carries a Manual Procedure, Decision: manualProcedure Added on Day 4, manualProcedure: string[] Field (The Differentiator), Non-Negotiable Rule 3: Every Decision Carries manualProcedure, 22 July Briefing (Anton and Shamal De Silva, CTO/Co-Founder CueGrowth, Judging Panel), Day 4: The Teach-Me Layer — The Bet Lands, The Differentiator: Every Decision Renders as a Teachable Procedure, manualProcedure Field (Teach-Me Layer Output) (+1 more)

### Community 10 - "Gmail & Tool Adapters"
Cohesion: 0.32
Nodes (8): Decision: Gmail OAuth Pulled Forward to Day 1, Taluni — Gmail Send/Poll and Remaining Tool Adapters Owner, lib/adapters/* (Remaining Tool Adapters), lib/gmail.ts (Gmail Send + Poll), Standing Rule: Nightly 15-Minute Full-Flow Run, All Four, Risk: Gmail OAuth Consumes Days (High), Taluni (A.L.M. Pabarusiri) — Backend: Gmail Adapter, Tool Adapters, Webhook/Trigger Layer, Section 4: Team Assignment

### Community 11 - "Simulated Tool Categories"
Cohesion: 0.29
Nodes (7): Accounting Tool Category (QuickBooks/Xero, Simulated), Calendar + SMS Tool Category (Google Cal/Twilio/Ideamart, Simulated), CRM Tool Category (HubSpot/Zoho, Simulated), Payments Tool Category (Stripe/PayHere, Simulated), Seeded Scenario: Open-Renewal, Simulated Tools as Real Function Calls Behind Identical Adapter Interface, Risk: Judges Read Simulated Tools as Fake (Medium)

### Community 12 - "Trail Steps Audit Table"
Cohesion: 0.50
Nodes (4): Day 2 (Jul 25): All 5 Tool Categories Callable; Trail Renders Step-by-Step, Non-Negotiable Rule 2: Every Tool Call Persists a trail_steps Row, trail_steps Audit Trail Table, Day 2: Five Tools and the Visible Trail

### Community 13 - "lib/types.ts Shared Ownership Rule"
Cohesion: 1.00
Nodes (3): Standing Rule: Nobody Edits lib/types.ts Alone, lib/types.ts (Decision, Invoice, TrailStep types), Standing Rule: Nobody Edits lib/types.ts Alone

## Knowledge Gaps
- **67 isolated node(s):** `outcomesByCustomer`, `JsonSchemaType`, `ToolParamSchema`, `ToolCall`, `LlmResponse` (+62 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Section 4: Team Assignment` connect `Gmail & Tool Adapters` to `Agent Core File Ownership`, `Locked Architecture & Judging Criteria`, `Recovery Ladder & Persistence`, `Human-in-the-Loop Dashboard`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Why does `Section 8: What 'Winning' Looks Like` connect `Locked Architecture & Judging Criteria` to `Teach-Me Differentiator`, `Gmail & Tool Adapters`, `Recovery Ladder & Persistence`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **Why does `Section 7: Risk Register` connect `Provider Switch & Freeze Rehearsal` to `Gmail & Tool Adapters`, `Simulated Tool Categories`, `Recovery Ladder & Persistence`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **What connects `outcomesByCustomer`, `JsonSchemaType`, `ToolParamSchema` to the rest of the system?**
  _67 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Agent Loop Runtime` be split into smaller, more focused modules?**
  _Cohesion score 0.1330049261083744 - nodes in this community are weakly interconnected._
- **Should `Locked Architecture & Judging Criteria` be split into smaller, more focused modules?**
  _Cohesion score 0.09057971014492754 - nodes in this community are weakly interconnected._
- **Should `Provider Switch & Freeze Rehearsal` be split into smaller, more focused modules?**
  _Cohesion score 0.11052631578947368 - nodes in this community are weakly interconnected._