import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowDownRight,
  Check,
  CornerUpRight,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Shuffle,
  Siren,
} from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site/site-shell";
import { PageTransition } from "@/components/ui/motion-primitives";
import { StaggerGrid, StaggerItem } from "@/components/ui/kpi-card";
import { Tag } from "@/components/ui/status-tag";

const FEATURES = {
  "autonomous-reasoning": {
    title: "Autonomous Reasoning",
    hero: "Two customers ten days late are not the same case.",
    lede: "The agent compares a customer against their own payment pattern, their open deals and their promise history — not a fixed aging threshold. Same lateness, different decision.",
  },
  "human-in-the-loop": {
    title: "Human-in-the-Loop Approval",
    hero: "Autonomous where it is safe. Gated where it is commercial.",
    lede: "The agent executes routine housekeeping on its own and stops at anything that changes commercial terms. You approve, edit, redirect, or override.",
  },
  "audit-trail": {
    title: "Audit Trail & Teach-Me",
    hero: "Every decision explains itself as a procedure you could follow.",
    lede: "Beyond the tool-call trail, each decision writes a manual procedure — the reasoning a person would need to reach the same conclusion without the agent.",
  },
  "tool-integrations": {
    title: "Five Tool Integrations",
    hero: "Five tool categories, one recovery ladder.",
    lede: "Accounting, email, payments, CRM and calendar/SMS. When a tool fails, the agent climbs a fixed ladder rather than silently dropping the work.",
  },
} as const;

type Slug = keyof typeof FEATURES;

function isSlug(slug: string): slug is Slug {
  return slug in FEATURES;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const f = isSlug(slug) ? FEATURES[slug] : undefined;
  const title = f ? `${f.title} — InvoiceChaser` : "InvoiceChaser";
  const description = f?.lede ?? "Autonomous accounts-receivable collection.";
  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image" },
  };
}

const scenarios = [
  {
    name: "Loyal payer",
    text: "Habitual lateness read as normal, so the tone stays relationship-aware.",
  },
  {
    name: "Promise-breaker",
    text: "Outcome memory from broken promises changes future behaviour.",
  },
  {
    name: "Open-renewal",
    text: "CRM context overrides aging urgency when the deal outweighs the invoice.",
  },
  {
    name: "Reconciliation short-payment",
    text: "A hypothesis chain that asks rather than force-matches the ledger.",
  },
  {
    name: "Low-confidence case",
    text: "Routes to ask_human instead of guessing at the customer's expense.",
  },
];

const gated = [
  "Any escalation beyond a first reminder",
  "Any payment plan, discount, or deadline extension",
  "Any dispute response",
  "Any legal or collections handoff recommendation",
];

const autonomous = [
  "First-touch reminders on pre-approved tone",
  "Payment reconciliation and receipts",
  "CRM and ledger housekeeping",
  "Scheduling its own follow-ups",
];

const humanPowers = [
  { name: "Approve", icon: Check },
  { name: "Edit", icon: Pencil },
  { name: "Redirect", icon: CornerUpRight },
  { name: "Override", icon: ShieldCheck },
];

const ladder = [
  {
    icon: RefreshCw,
    name: "Retry with backoff",
    text: "Transient failures get a second chance before anything else changes.",
  },
  {
    icon: Shuffle,
    name: "Fall back to an equivalent tool",
    text: "A blocked provider is swapped for one with the same capability.",
  },
  {
    icon: ArrowDownRight,
    name: "Degrade gracefully",
    text: "Work is queued, never silently dropped.",
  },
  {
    icon: Siren,
    name: "Escalate with a structured report",
    text: "What was tried, what was found, what could not be resolved.",
  },
];

export default async function FeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();
  const feature = FEATURES[slug];

  return (
    <div className="min-h-screen">
      <SiteNav />
      <PageTransition>
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-12">
          <Tag tone="info">{feature.title}</Tag>
          <h1 className="mt-6 max-w-3xl text-h1 text-neutral-900">{feature.hero}</h1>
          <p className="mt-5 max-w-2xl text-body-lg text-neutral-500">{feature.lede}</p>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          {slug === "autonomous-reasoning" && (
            <StaggerGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {scenarios.map((s) => (
                <StaggerItem key={s.name}>
                  <div className="h-full rounded-lg border border-neutral-100 bg-white p-6 shadow-sm">
                    <h2 className="text-h3 text-neutral-900">{s.name}</h2>
                    <p className="mt-2 text-body text-neutral-500">{s.text}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGrid>
          )}

          {slug === "human-in-the-loop" && (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-warning-border bg-white p-6 shadow-sm">
                  <Tag tone="warning">Gated — human decides first</Tag>
                  <ul className="mt-5 space-y-3">
                    {gated.map((g) => (
                      <li key={g} className="text-body text-neutral-700">
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-success-border bg-white p-6 shadow-sm">
                  <Tag tone="success">Autonomous — human inspects after</Tag>
                  <ul className="mt-5 space-y-3">
                    {autonomous.map((a) => (
                      <li key={a} className="text-body text-neutral-700">
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-caption text-neutral-500 uppercase">Human powers</p>
                <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {humanPowers.map((power) => (
                    <div
                      key={power.name}
                      className="h-full rounded-lg border border-neutral-100 bg-white p-6 shadow-sm"
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-md bg-primary-50 text-primary-500">
                        <power.icon size={20} strokeWidth={2} />
                      </span>
                      <h3 className="mt-4 text-h3 text-neutral-900">{power.name}</h3>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {slug === "audit-trail" && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-danger-border bg-white p-6 shadow-sm">
                <Tag tone="danger">Wrong</Tag>
                <p className="mt-5 text-body text-neutral-700 text-balance">
                  Called lookup_crm. Called check_payment_history. Sent email. This logs the tools
                  but never explains why the customer received that action or how to repeat the
                  judgment.
                </p>
              </div>
              <div className="rounded-lg border border-success-border bg-white p-6 shadow-sm">
                <Tag tone="success">Right</Tag>
                <p className="mt-5 text-body text-neutral-700 text-balance">
                  Compare the overdue invoice with this customer&apos;s payment pattern and open
                  deals. Explain why a softer reminder protects the relationship before choosing the
                  action.
                </p>
              </div>
            </div>
          )}

          {slug === "tool-integrations" && (
            <StaggerGrid className="grid gap-6 md:grid-cols-2">
              {ladder.map((r, i) => (
                <StaggerItem key={r.name}>
                  <div className="h-full rounded-lg border border-neutral-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-md bg-primary-50 text-primary-500">
                        <r.icon size={20} strokeWidth={2} />
                      </span>
                      <span className="text-caption text-neutral-500">Rung {i + 1}</span>
                    </div>
                    <h2 className="mt-4 text-h3 text-neutral-900">{r.name}</h2>
                    <p className="mt-2 text-body text-neutral-500">{r.text}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGrid>
          )}
        </section>
      </PageTransition>
      <SiteFooter />
    </div>
  );
}
