// Rewrites data/seed.ts email fields back to their canonical REPLACE_ME placeholder,
// derived deterministically from the adjacent customerId — no mapping file needed.
// Used two ways (see .gitattributes + scripts/setup-git-hooks.mjs):
//   node scripts/scrub-seed-emails.mjs           -> git clean filter (stdin -> stdout)
//   node scripts/scrub-seed-emails.mjs --check   -> stdin -> exit 1 if anything would change

import { pathToFileURL } from "node:url";

const OBJECT_EMAIL_RE = /customerId:\s*"([^"]+)"([\s\S]*?)email:\s*"([^"]*)"/g;

export function scrubSeedEmails(source) {
  let changed = false;
  const result = source.replace(OBJECT_EMAIL_RE, (match, customerId, between, currentEmail) => {
    const placeholder = `REPLACE_ME.${customerId.toLowerCase().replace(/-/g, "")}@example.com`;
    if (currentEmail === placeholder) return match;
    changed = true;
    return `customerId: "${customerId}"${between}email: "${placeholder}"`;
  });
  return { result, changed };
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
}

function selfCheck() {
  const { result, changed } = scrubSeedEmails(
    'customerId: "CUST-001",\n  email: "real.person@gmail.com",',
  );
  if (!changed || !result.includes('email: "REPLACE_ME.cust001@example.com"')) {
    throw new Error("scrubSeedEmails did not scrub a real address as expected");
  }
  if (scrubSeedEmails(result).changed) {
    throw new Error("scrubSeedEmails should be a no-op on an already-placeholder value");
  }
  console.log("scrub-seed-emails.mjs: self-check passed.");
}

async function main() {
  if (process.argv.includes("--selfcheck")) {
    selfCheck();
    return;
  }

  const source = await readStdin();
  const { result, changed } = scrubSeedEmails(source);

  if (process.argv.includes("--check")) {
    if (changed) {
      console.error("BLOCKED: data/seed.ts has real email address(es) staged for commit.");
      process.exitCode = 1;
    }
    return;
  }

  process.stdout.write(result);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
