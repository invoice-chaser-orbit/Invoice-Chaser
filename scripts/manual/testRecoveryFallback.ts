import { forceToolFailure } from "../../agent/debugToggle.js";
import { dispatchTool } from "../../agent/tools.js";
import { withRecovery } from "../../agent/recovery.js";
import { recordOutcome } from "../../agent/memory.js";
import { seedInvoices } from "../../data/seed.js";
import { randomUUID } from "node:crypto";

async function main() {
    const invoice = seedInvoices[0];
    const decisionId = randomUUID();

    // Create the real decision row first — trail_steps needs this to exist
    await recordOutcome({
        id: decisionId,
        invoiceId: invoice.id,
        customerId: invoice.customerId,
        goal: "Test recovery ladder",
        trail: [],
        action: "",
        reasoning: "",
        manualProcedure: [],
        confidence: 0,
        escalationReason: null,
        status: "pending_approval",
        createdAt: new Date().toISOString(),
    });

    const args = { customerId: invoice.customerId, tone: "neutral", message: "Test during forced failure" };

    forceToolFailure("send_reminder_email");

    const result = await withRecovery({
        decisionId,
        stepIndex: 1,
        toolName: "send_reminder_email",
        input: args,
        primaryCall: async () => dispatchTool("send_reminder_email", args),
        fallbackCall: async () => dispatchTool("send_sms_reminder", { ...args, note: "email delivery failed" }),
    });

    console.log("Rung used:", result.rungUsed);
    console.log("Output:", result.output);

    forceToolFailure(null);
}

main().catch((err) => console.error("Unexpected:", err));