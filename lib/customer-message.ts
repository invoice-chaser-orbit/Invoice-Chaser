// The model sometimes returns escaped paragraph separators as ordinary text.
// Normalize them for both the approval preview and the exact email sent.
export function formatCustomerMessage(message: string): string {
  return message
    .replace(/\\r\\n|\\n|\\r/g, "\n")
    .replace(/\r\n?/g, "\n")
    .replace(/\bInvoiceChase\b/g, "InvoiceChaser")
    .trim();
}
