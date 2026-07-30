import { sendEmail, pollReplies } from "../../lib/gmail.js";
import { seedInvoices } from "../../data/seed.js";

async function main() {
    const { messageId } = await sendEmail(
        seedInvoices[0].email,
        "Adapter test",
        "Testing the reusable sendEmail function."
    );
    console.log("Sent via adapter, message ID:", messageId);
}

main();