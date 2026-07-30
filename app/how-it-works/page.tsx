import type { Metadata } from "next";
import {
  Activity,
  Brain,
  CalendarClock,
  Eye,
  Mail,
  Send,
  Webhook,
} from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site/site-shell";
import { PageTransition } from "@/components/ui/motion-primitives";
import { StaggerGrid, StaggerItem } from "@/components/ui/kpi-card";
import { Tag } from "@/components/ui/status-tag";

export const metadata: Metadata = {
  title: "How InvoiceChaser works — sense, reason, act, observe",
  description:
    "The four-stage loop, the three triggers that wake it, the five tool categories it acts through, and exactly which actions are gated behind a human.",
  openGraph: {
    title: "How InvoiceChaser works — sense, reason, act, observe",
    description: "The loop, the triggers, the tools, and the human-in-the-loop split.",
    type: "article",
  },
  twitter: { card: "summary_large_image" },
};

const stages = [
  {
    icon: Activity,
    name: "Sense",
    text: "Every run begins by reading state rather than assuming it. The agent pulls the aging report, new inbound replies and settled payments. Nothing is decided at this stage — it only establishes what is true right now.",
  },
  {
    icon: Brain,
    name: "Reason",
    text: "The agent compares this customer against their own history rather than a fixed threshold. Open deals, relationship length, and past promises all move the decision. This is where two identically-late invoices stop being the same case.",
  },
  {
    icon: Send,
    name: "Act",
    text: "Pre-approved actions execute immediately. Anything that changes commercial terms is drafted, explained, and queued for a human. The agent never quietly widens its own authority.",
  },
  {
    icon: Eye,
    name: "Observe",
    text: "Outcomes are written back to the customer record — a kept promise, a broken one, a dispute opened. The next decision on that customer inherits it, so behaviour actually changes over time.",
  },
];

const triggers = [
  {
    icon: CalendarClock,
    name: "Daily ledger scan",
    text: "A scheduled sweep of the receivables ledger for invoices crossing terms.",
  },
  {
    icon: Mail,
    name: "Inbound email reply",
    text: "A customer response reopens the case with new information attached.",
  },
  {
    icon: Webhook,
    name: "Payment webhook",
    text: "A settlement event triggers reconciliation and closes open follow-ups.",
  },
];

const tools = [
  { category: "Accounting", binding: "QuickBooks / Xero", live: false },
  { category: "Email", binding: "Gmail / Outlook", live: true },
  { category: "Payments", binding: "Stripe / PayHere", live: false },
  { category: "CRM", binding: "HubSpot / Zoho", live: false },
  { category: "Calendar + SMS", binding: "Google Cal / Twilio / Ideamart", live: false },
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

export default function HowItWorks() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <PageTransition>
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-12">
          <h1 className="max-w-3xl text-h1 text-neutral-900">
            A loop, not a reminder schedule.
          </h1>
          <p className="mt-5 max-w-2xl text-body-lg text-neutral-500">
            InvoiceChaser runs sense → reason → act → observe continuously over the
            receivables ledger, against one standing goal: minimise overdue
            receivables without damaging customer relationships.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <StaggerGrid className="grid gap-6 md:grid-cols-2">
            {stages.map((s) => (
              <StaggerItem key={s.name}>
                <div className="h-full rounded-lg border border-neutral-100 bg-white p-6 shadow-sm">
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-primary-50 text-primary-500">
                    <s.icon size={20} strokeWidth={2} />
                  </span>
                  <h2 className="mt-4 text-h3 text-neutral-900">{s.name}</h2>
                  <p className="mt-2 text-body text-neutral-500">{s.text}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <h2 className="text-h2 text-neutral-900">Three triggers</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {triggers.map((t) => (
              <div
                key={t.name}
                className="rounded-lg border border-neutral-100 bg-white p-6 shadow-sm"
              >
                <span className="grid h-10 w-10 place-items-center rounded-md bg-primary-50 text-primary-500">
                  <t.icon size={20} strokeWidth={2} />
                </span>
                <h3 className="mt-4 text-h3 text-neutral-900">{t.name}</h3>
                <p className="mt-2 text-body text-neutral-500">{t.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <h2 className="text-h2 text-neutral-900">Five tool categories</h2>
          <div className="mt-8 overflow-hidden rounded-lg border border-neutral-100 bg-white shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-caption text-neutral-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-caption text-neutral-500 uppercase">
                    Real-world binding
                  </th>
                  <th className="px-6 py-3 text-caption text-neutral-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {tools.map((t) => (
                  <tr
                    key={t.category}
                    className="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50"
                  >
                    <td className="px-6 py-4 text-body font-semibold text-neutral-900">
                      {t.category}
                    </td>
                    <td className="px-6 py-4 text-body text-neutral-700">
                      {t.binding}
                    </td>
                    <td className="px-6 py-4">
                      <Tag tone={t.live ? "success" : "neutral"}>
                        {t.live ? "Live" : "Simulated"}
                      </Tag>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <h2 className="text-h2 text-neutral-900">Human in the loop</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
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
          <div className="mt-6 rounded-lg border border-neutral-100 bg-white p-6 shadow-sm">
            <p className="text-caption text-neutral-500 uppercase">
              Human powers
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {["Approve", "Edit", "Redirect", "Override"].map((p) => (
                <Tag key={p} tone="info">
                  {p}
                </Tag>
              ))}
            </div>
          </div>
        </section>
      </PageTransition>
      <SiteFooter />
    </div>
  );
}
