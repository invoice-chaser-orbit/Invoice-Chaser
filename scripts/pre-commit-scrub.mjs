// Backstop for the .gitattributes clean filter: if data/seed.ts was staged before the filter
// applied (stale index, or a git client that staged it in a way that skipped the filter), scrub
// the STAGED blob in place and re-point the index at it. Never touches the working tree file.

import { execFileSync } from "node:child_process";
import { scrubSeedEmails } from "./scrub-seed-emails.mjs";

try {
  const staged = execFileSync("git", ["show", ":data/seed.ts"], { encoding: "utf-8" });
  const { result, changed } = scrubSeedEmails(staged);
  if (changed) {
    const hash = execFileSync("git", ["hash-object", "-w", "--stdin"], { input: result })
      .toString()
      .trim();
    execFileSync("git", ["update-index", "--cacheinfo", `100644,${hash},data/seed.ts`]);
    console.log("data/seed.ts: auto-scrubbed real email(s) before commit.");
  }
} catch {
  // data/seed.ts not tracked/staged - nothing to do
}
