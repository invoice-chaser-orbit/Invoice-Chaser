import { dispatchTool } from "./agent/tools.js";
import { seedInvoices } from "./data/seed.js";

async function main() {
    // Pick 2-3 different customers to test variety
    const testInvoices = seedInvoices.slice(0, 3); // first 3, or pick specific IDs

    for (const invoice of testInvoices) {
        console.log(`\nTesting send for ${invoice.customerId} (${invoice.customerName})`);
        try {
            const result = await dispatchTool("send_reminder_email", {
                customerId: invoice.customerId,
                tone: "neutral",
                message: `Hi, this is a reminder that invoice ${invoice.id} is overdue. Please arrange payment soon.`,
            });
            console.log("✅ Success:", result);
        } catch (err) {
            console.error("❌ Failed:", err);
        }
    }
}

main();