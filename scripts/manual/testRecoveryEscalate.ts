import { forceToolFailure } from "../../agent/debugToggle.js";
import { dispatchTool } from "../../agent/tools.js";
import { withRecovery } from "../../agent/recovery.js";
import { recordOutcome } from "../../agent/memory.js";
import { seedInvoices } from "../../data/seed.js";
import { randomUUID } from "node:crypto";

async function main() {
    const invoice = seedInvoices[0];
    const decisionId = randomUUID();

    await recordOutcome({
        id: decisionId,
        invoiceId: invoice.id,
        customerId: invoice.customerId,
        goal: "Test recovery ladder — no fallback, force full escalation",
        trail: [],
        action: "",
        reasoning: "",
        manualProcedure: [],
        confidence: 0,
        escalationReason: null,
        status: "pending_approval",
        createdAt: new Date().toISOString(),
    });

    const args = { customerId: invoice.customerId, tone: "neutral", message: "Test with no fallback" };

    forceToolFailure("send_reminder_email");

    const result = await withRecovery({
        decisionId,
        stepIndex: 1,
        toolName: "send_reminder_email",
        input: args,
        primaryCall: async () => dispatchTool("send_reminder_email", args),
        // no fallbackCall this time — forces it past rung 2, into degrade + escalate
    });

    console.log("Rung used:", result.rungUsed);
    console.log("Output:", JSON.stringify(result.output, null, 2));

    forceToolFailure(null);
}

main().catch((err) => console.error("Unexpected:", err));