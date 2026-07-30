import type { Metadata } from "next";
import Link from "next/link";
import { Activity, Brain, Eye, Send } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site/site-shell";
import { Typewriter } from "@/components/ui/typewriter";
import { IcButton } from "@/components/ui/ic-button";
import { OverviewPanel } from "@/components/dashboard/overview-panel";
import { PageTransition } from "@/components/ui/motion-primitives";
import { StaggerGrid, StaggerItem } from "@/components/ui/kpi-card";
import { Tag } from "@/components/ui/status-tag";
import { getInvoices } from "@/lib/invoices";
import { getDecisions } from "@/lib/decisions";

export const metadata: Metadata = {
  title: "InvoiceChaser — Same lateness. Different decisions.",
  description:
    "An autonomous accounts-receivable agent that senses, reasons, acts and observes across your ledger — minimising overdue receivables without damaging customer relationships.",
  openGraph: {
    title: "InvoiceChaser — Same lateness. Different decisions.",
    description: "Autonomous AR collection for SMEs, with a human in the loop on every gated action.",
  },
};

const loopStages = [
  {
    icon: Activity,
    name: "Sense",
    text: "A daily ledger scan, an inbound email reply, or a payment webhook wakes the agent with fresh state.",
  },
  {
    icon: Brain,
    name: "Reason",
    text: "It weighs this customer's own history, open deals and past promises before it picks a tone.",
  },
  {
    icon: Send,
    name: "Act",
    text: "Pre-approved actions execute. Anything commercial is drafted and handed to a human.",
  },
  {
    icon: Eye,
    name: "Observe",
    text: "Outcomes are written back, so the next decision on the same customer starts smarter.",
  },
];

const tools = [
  { category: "Accounting", binding: "QuickBooks / Xero", live: false },
  { category: "Email", binding: "Gmail / Outlook", live: true },
  { category: "Payments", binding: "Stripe / PayHere", live: false },
  { category: "CRM", binding: "HubSpot / Zoho", live: false },
  { category: "Calendar + SMS", binding: "Google Cal / Twilio / Ideamart", live: false },
];

export default async function Landing() {
  const [invoices, decisions] = await Promise.all([getInvoices(), getDecisions()]);

  return (
    <div className="min-h-screen">
      <SiteNav />
      <PageTransition>
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
          <Tag tone="info">sense → reason → act → observe</Tag>
          <h1 className="mx-auto mt-6 max-w-3xl text-h1 text-neutral-900">
            <Typewriter text="Same lateness. Different decisions." />
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-body-lg text-neutral-500">
            InvoiceChaser runs continuously over your receivables ledger with one
            standing goal: minimise overdue receivables without damaging customer
            relationships. Two customers ten days late are not the same customer.
          </p>
          <div className="mt-8 flex justify-center">
            <IcButton asChild>
              <Link href="/overview">Get started</Link>
            </IcButton>
          </div>

          <div className="mt-16 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-4 rounded-sm bg-white px-3 py-1 text-caption text-neutral-500">
                app.invoicechaser.com/overview
              </span>
            </div>
            <div className="max-h-[620px] overflow-hidden p-6 text-left">
              <OverviewPanel invoices={invoices} decisions={decisions} compact />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-h2 text-neutral-900">The loop</h2>
          <p className="mt-2 max-w-2xl text-body text-neutral-500">
            Four stages, running continuously over the receivables ledger.
          </p>
          <StaggerGrid className="mt-10 grid gap-6 md:grid-cols-4">
            {loopStages.map((s, i) => (
              <StaggerItem key={s.name}>
                <div className="h-full rounded-lg border border-neutral-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-md bg-primary-50 text-primary-500">
                      <s.icon size={20} strokeWidth={2} />
                    </span>
                    <span className="text-caption text-neutral-500">
                      Stage {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-h3 text-neutral-900">{s.name}</h3>
                  <p className="mt-2 text-body text-neutral-500">{s.text}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
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
          <div className="rounded-xl bg-neutral-900 px-10 py-16 text-center">
            <h2 className="text-h2 text-white">
              Put a reasoning agent on your aging report.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-body-lg text-neutral-300">
              Autonomous where it is safe, gated where it is commercial, and fully
              auditable either way.
            </p>
            <div className="mt-8 flex justify-center">
              <IcButton asChild>
                <Link href="/overview">Get started</Link>
              </IcButton>
            </div>
          </div>
        </section>
      </PageTransition>
      <SiteFooter />
    </div>
  );
}
