// Wires up the local git config + a pre-commit backstop so real seed emails never reach a
// commit. Runs automatically via the "prepare" npm lifecycle script (fires on `npm install`).
// Safe to re-run any time; also runnable directly: `node scripts/setup-git-hooks.mjs`.

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const HOOK_PATH = path.join(process.cwd(), ".git", "hooks", "pre-commit");

// Backstop only — the clean filter should already have scrubbed anything staged by the time
// this runs. If it hasn't (e.g. the file was staged before the filter was configured), silently
// fix the staged blob rather than blocking the commit.
const HOOK_SCRIPT = String.raw`#!/bin/sh
node scripts/pre-commit-scrub.mjs
`;

try {
  execSync('git config filter.scrub-seed-emails.clean "node scripts/scrub-seed-emails.mjs"');
  execSync("git config filter.scrub-seed-emails.smudge cat");
  fs.mkdirSync(path.dirname(HOOK_PATH), { recursive: true });
  fs.writeFileSync(HOOK_PATH, HOOK_SCRIPT, { mode: 0o755 });
  console.log("git email-scrub filter + pre-commit backstop installed.");
} catch (err) {
  console.warn("Skipping git hook setup (not a git repo?):", String(err?.message ?? err));
}
