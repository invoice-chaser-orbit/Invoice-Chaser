// Assert-based self-check for the pure logic extracted from agent/classifier.ts. No framework,
// no network call — run with `npm run selfcheck`. Exits non-zero on any failed assert.

import assert from "node:assert";
import { parseClassification } from "./classifier.js";

assert.strictEqual(parseClassification("promise"), "promise");
assert.strictEqual(parseClassification("Dispute"), "dispute");
assert.strictEqual(parseClassification("  partial-payment\n"), "partial-payment");
assert.strictEqual(parseClassification("query"), "query");
assert.throws(() => parseClassification("garbage"));
assert.throws(() => parseClassification(""));

console.log("agent/classifier.selfcheck.ts: all checks passed.");
