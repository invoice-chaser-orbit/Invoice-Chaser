import { getDecisions } from "@/lib/decisions";
import { getInvoiceCatalog } from "@/lib/invoices";
import { searchDecisions } from "@/lib/search-decisions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query) return Response.json({ count: 0, results: [] });
  try {
    const [decisions, invoices] = await Promise.all([getDecisions(), getInvoiceCatalog()]);
    const results = searchDecisions(decisions, invoices, query);
    return Response.json({ count: results.length, results: results.slice(0, 6) });
  } catch {
    return Response.json({ error: "Search is unavailable right now." }, { status: 500 });
  }
}
