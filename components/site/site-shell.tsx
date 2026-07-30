import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { IcButton } from "@/components/ui/ic-button";

export const featureLinks = [
  { slug: "autonomous-reasoning", label: "Autonomous Reasoning" },
  { slug: "human-in-the-loop", label: "Human-in-the-Loop Approval" },
  { slug: "audit-trail", label: "Audit Trail & Teach-Me" },
  { slug: "tool-integrations", label: "Five Tool Integrations" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-primary-500">
        <span className="grid grid-cols-2 gap-0.5">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-white" />
          ))}
        </span>
      </span>
      <span className="text-[17px] font-extrabold tracking-tight text-neutral-900">
        InvoiceChaser
      </span>
    </Link>
  );
}

export function SiteNav() {
  return (
    <header className="sticky top-4 z-40 px-4 md:px-8">
      <div className="glass glass-white mx-auto flex h-16 max-w-6xl items-center justify-between rounded-2xl px-6 shadow-lg">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-body text-neutral-700 transition-colors hover:text-primary-500"
          >
            Home
          </Link>
          <Link
            href="/how-it-works"
            className="text-body text-neutral-700 transition-colors hover:text-primary-500"
          >
            How It Works
          </Link>
          <div className="group relative">
            <button className="inline-flex items-center gap-1 text-body text-neutral-700 transition-colors group-hover:text-primary-500">
              Features
              <ChevronDown size={16} strokeWidth={2} />
            </button>
            <div className="invisible absolute top-full left-1/2 w-64 -translate-x-1/2 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
              <div className="rounded-lg border border-neutral-100 bg-white p-2 shadow-lg">
                {featureLinks.map((f) => (
                  <Link
                    key={f.slug}
                    href={`/features/${f.slug}`}
                    className="block rounded-sm px-3 py-2 text-body text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-primary-500"
                  >
                    {f.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
        <IcButton asChild size="sm">
          <Link href="/overview">Get started</Link>
        </IcButton>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const columns = [
    {
      title: "Product",
      links: [
        { label: "How It Works", to: "/how-it-works" },
        { label: "Dashboard", to: "/overview" },
        { label: "Decisions", to: "/decisions" },
      ],
    },
    {
      title: "Features",
      links: featureLinks.slice(0, 3).map((f) => ({
        label: f.label,
        to: `/features/${f.slug}`,
      })),
    },
    {
      title: "More",
      links: [
        { label: "Five Tool Integrations", to: "/features/tool-integrations" },
        { label: "Approval queue", to: "/approvals" },
      ],
    },
  ];

  return (
    <footer className="border-t border-neutral-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-body text-neutral-500">
            An autonomous accounts-receivable collection agent for SMEs.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-caption text-neutral-900 uppercase">{col.title}</p>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.to}
                    className="text-body text-neutral-500 transition-colors hover:text-primary-500"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-neutral-100 py-6">
        <p className="mx-auto max-w-6xl px-6 text-caption text-neutral-500">
          © 2026 InvoiceChaser. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
