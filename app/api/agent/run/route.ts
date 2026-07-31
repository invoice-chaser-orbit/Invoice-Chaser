import { runDailyScan } from "@/agent/loop";
import type { Decision, Invoice } from "@/lib/types";

export const dynamic = "force-dynamic";

// NDJSON stream: one `{ decision, invoice }` line per completed decision, then a final
// `{ done: true, total }` line. A POST because this triggers a real agent run against Gemini and
// the accounting/CRM/payments/calendar adapters, not a GET-safe read.
export async function POST() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const line = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      try {
        const decisions = await runDailyScan((decision: Decision, invoice: Invoice) => {
          line({ decision, invoice });
        });
        line({ done: true, total: decisions.length });
      } catch (err) {
        line({ error: err instanceof Error ? err.message : "Agent run failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store" },
  });
}
