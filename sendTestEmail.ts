import { sendEmail } from "./lib/gmail.js";

sendEmail(
    "taluni278tp@gmail.com",  // <-- replace with your actual debtor test address
    "Test from InvoiceChaser",
    "Hello, this is a test reminder from the InvoiceChaser agent."
).then(({ messageId }) => console.log("Sent! Message ID:", messageId));
