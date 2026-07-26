import { sendEmail, pollReplies } from "./lib/gmail.js";

async function main() {
    const { messageId } = await sendEmail(
        "taluni278tp@gmail.com", // replace with your real debtor address
        "Adapter test",
        "Testing the reusable sendEmail function."
    );
    console.log("Sent via adapter, message ID:", messageId);
}

main();