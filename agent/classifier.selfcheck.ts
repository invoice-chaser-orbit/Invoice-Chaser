// Assert-based self-check for the pure logic extracted from agent/classifier.ts. No framework,
// no network call by default — run with `npm run selfcheck`. Exits non-zero on any failed assert.

import assert from "node:assert";
import { parseClassification, classifyReply, type ReplyClassification } from "./classifier.js";

assert.strictEqual(parseClassification("promise"), "promise");
assert.strictEqual(parseClassification("Dispute"), "dispute");
assert.strictEqual(parseClassification("  partial-payment\n"), "partial-payment");
assert.strictEqual(parseClassification("query"), "query");
assert.throws(() => parseClassification("garbage"));
assert.throws(() => parseClassification(""));

console.log("agent/classifier.selfcheck.ts: pure parser checks passed.");

// Sample replies for classifyReply() itself, including deliberately ambiguous ones — the
// borderline cases matter more than the obvious ones. This makes a real Gemini call per sample,
// so it's opt-in (RUN_LIVE_CLASSIFIER_CHECK=1) rather than part of the default `npm run selfcheck`
// chain, to avoid spending API quota on every run.
const LIVE_SAMPLES: { body: string; expectOneOf: ReplyClassification[] }[] = [
  { body: "I'll pay this by next Friday, sorry for the delay.", expectOneOf: ["promise"] },
  { body: "This invoice is wrong, we never received half these items.", expectOneOf: ["dispute"] },
  { body: "We've sent 50000 of the 80000 due, the rest follows next week.", expectOneOf: ["partial-payment"] },
  { body: "Can you resend the itemised breakdown for this invoice?", expectOneOf: ["query"] },
  { body: "Already paid this on the 3rd, please check your records.", expectOneOf: ["dispute", "query"] },
  { body: "Yes, will settle it. Not sure exactly when though.", expectOneOf: ["promise", "query"] },
  { body: "We only agreed to 90% of this — the rest was never confirmed.", expectOneOf: ["dispute"] },
  { body: "Sent a partial amount for now, will clear the balance once cash flow improves.", expectOneOf: ["partial-payment", "promise"] },
  { body: "Who is this regarding? We don't recognise this invoice number.", expectOneOf: ["query"] },
  { body: "Ok.", expectOneOf: ["query", "promise", "dispute", "partial-payment"] },
];

async function runLiveClassifierCheck(): Promise<void> {
  let passed = 0;
  for (const sample of LIVE_SAMPLES) {
    const result = await classifyReply(sample.body);
    assert.ok(
      sample.expectOneOf.includes(result),
      `"${sample.body}" classified as "${result}", expected one of [${sample.expectOneOf.join(", ")}]`,
    );
    passed += 1;
  }
  console.log(`agent/classifier.selfcheck.ts: live classifyReply() checks passed (${passed}/${LIVE_SAMPLES.length}).`);
}

if (process.env.RUN_LIVE_CLASSIFIER_CHECK === "1") {
  await runLiveClassifierCheck();
} else {
  console.log(
    "agent/classifier.selfcheck.ts: skipping live classifyReply() checks " +
      "(set RUN_LIVE_CLASSIFIER_CHECK=1 to run them against the real Gemini API).",
  );
}
