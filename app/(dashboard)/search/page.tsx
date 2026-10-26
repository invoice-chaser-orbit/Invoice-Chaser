import type { Metadata } from "next";
import { SearchResults } from "@/components/dashboard/search-results";
import { getDecisions } from "@/lib/decisions";
import { getInvoiceCatalog } from "@/lib/invoices";
import { searchDecisions } from "@/lib/search-decisions";

export const metadata: Metadata = {
  title: "Search — InvoiceChaser",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const [decisions, invoices] = query
    ? await Promise.all([getDecisions(), getInvoiceCatalog()])
    : [[], []];
  return (
    <SearchResults
      key={query}
      query={query}
      results={searchDecisions(decisions, invoices, query)}
    />
  );
}
