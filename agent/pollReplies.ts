// Sensing side for trigger type 2 (inbound email reply — see CLAUDE.md "The loop"). Matches a
// Gmail reply to a seeded invoice, classifies it, and hands off to the same reasoning core
// (runReplyDecision in agent/loop.ts) that the daily-scan trigger uses.

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { pollReplies } from "../lib/gmail.js";
import { classifyReply, type ReplyClassification } from "./classifier.js";
import { runReplyDecision } from "./loop.js";
import { seedInvoices } from "../data/seed.js";
import type { Decision, Invoice } from "../lib/types.js";

// ponytail: local file cursor — fine for a single demo machine; move to a Supabase table if
// polling ever needs to run from more than one instance.
const STATE_FILE = path.join(process.cwd(), ".reply-poll-state.json");
const DEFAULT_LOOKBACK_MS = 24 * 60 * 60 * 1000;

interface PollState {
  lastPolledAt: string;
}

function loadState(): PollState {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
  } catch {
    return { lastPolledAt: new Date(Date.now() - DEFAULT_LOOKBACK_MS).toISOString() };
  }
}

function saveState(state: PollState): void {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

export function extractEmailAddress(from: string): string {
  const match = from.match(/<([^>]+)>/);
  return (match ? match[1] : from).trim().toLowerCase();
}

export function findInvoiceByEmail(from: string): Invoice | undefined {
  const address = extractEmailAddress(from);
  return seedInvoices.find((inv) => inv.email.toLowerCase() === address);
}

const FALLBACK_CLASSIFICATION: ReplyClassification = "query";

async function classifyWithFallback(body: string): Promise<ReplyClassification> {
  try {
    return await classifyReply(body);
  } catch (err) {
    console.warn(`  [WARN] Could not classify reply, defaulting to "query": ${String(err)}`);
    return FALLBACK_CLASSIFICATION;
  }
}

export async function pollAndProcessReplies(): Promise<Decision[]> {
  const state = loadState();
  const since = new Date(state.lastPolledAt);
  const polledAt = new Date();

  const replies = await pollReplies(since);
  console.log(`Found ${replies.length} reply(ies) since ${since.toISOString()}`);

  const decisions: Decision[] = [];
  for (const reply of replies) {
    const invoice = findInvoiceByEmail(reply.from);
    if (!invoice) {
      console.log(`  Skipping reply from "${reply.from}" — no matching seeded invoice.`);
      continue;
    }

    console.log(`  Processing reply from ${invoice.customerName} re ${invoice.id}...`);
    const classification = await classifyWithFallback(reply.body);
    console.log(`  Classified as "${classification}".`);
    const decision = await runReplyDecision(invoice, reply, classification);
    decisions.push(decision);
    console.log(`  -> ${decision.status} (confidence ${decision.confidence}): ${decision.action}`);
  }

  saveState({ lastPolledAt: polledAt.toISOString() });
  return decisions;
}

async function main(): Promise<void> {
  const decisions = await pollAndProcessReplies();
  console.log(`\nProcessed ${decisions.length} reply-triggered decision(s).`);
}

// Only run the live poll when this file is executed directly, not when imported for its exported
// functions (e.g. agent/loop.selfcheck.ts) — same gating pattern as agent/loop.ts.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((err) => {
    console.error("Reply poll failed:", err);
    process.exitCode = 1;
  });
}
