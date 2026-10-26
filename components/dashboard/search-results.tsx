"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardTopbar } from "@/components/dashboard/dashboard-shell";
import { DataCell, DataRow, DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination-nav";
import { PageTransition } from "@/components/ui/motion-primitives";
import { formatDateTime } from "@/lib/format";
import type { DecisionSearchHit } from "@/lib/search-decisions";

const PAGE_SIZE = 5;

export function SearchResults({ query, results }: { query: string; results: DecisionSearchHit[] }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <PageTransition className="space-y-8">
      <DashboardTopbar title="search" />
      <div>
        <h1 className="text-h2 text-neutral-900">Search results</h1>
        <p className="mt-1 text-body text-neutral-500">
          {query
            ? `${results.length} decision${results.length === 1 ? "" : "s"} matching “${query}”`
            : "Enter a customer, invoice, or decision in the search bar."}
        </p>
      </div>
      {results.length > 0 && (
        <>
          <DataTable
            headers={["Customer", "Action", "Status", "Created"]}
            columnWidths={["25%", "40%", "17%", "18%"]}
            className="min-h-[608px]"
            tableClassName="min-w-[900px] table-fixed"
          >
            {current.map((result) => (
              <DataRow key={result.id} className="h-28">
                <DataCell>
                  <Link
                    href={`/decisions/${result.id}`}
                    className="font-semibold text-neutral-900 hover:text-primary-600 hover:underline"
                  >
                    {result.customer}
                  </Link>
                  <span className="block text-caption text-neutral-500">{result.invoiceId}</span>
                </DataCell>
                <DataCell>
                  <span className="line-clamp-2">{result.action}</span>
                </DataCell>
                <DataCell>{result.status}</DataCell>
                <DataCell className="whitespace-nowrap">
                  {formatDateTime(result.createdAt)}
                </DataCell>
              </DataRow>
            ))}
          </DataTable>
          <div className="flex justify-end">
            <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </div>
        </>
      )}
      {query && results.length === 0 && (
        <p className="text-body text-neutral-500">No matching decisions.</p>
      )}
    </PageTransition>
  );
}
