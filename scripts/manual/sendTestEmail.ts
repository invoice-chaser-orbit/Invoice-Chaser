import { sendEmail } from "../../lib/gmail.js";
import { seedInvoices } from "../../data/seed.js";

sendEmail(
  seedInvoices[0].email,
  "Test from InvoiceChaser",
  "Hello, this is a test reminder from the InvoiceChaser agent.",
).then(({ messageId }) => console.log("Sent! Message ID:", messageId));
