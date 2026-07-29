import type { Invoice } from "../lib/types.js";

// Five invoice personalities. Each proves one specific agent behaviour — see CLAUDE.md
// "SEEDED SCENARIOS" section. Do not edit these into blandness.

export const seedInvoices: Invoice[] = [
  {
    // Loyal payer: habitually 10-15 days late for years, large account, renewal open.
    // Proves the agent reads pattern relative to the customer, not an absolute threshold.
    id: "INV-1043",
    customerId: "CUST-001",
    customerName: "Lanka Hardware (Pvt) Ltd",
    amountDue: 100000,
    currency: "LKR",
    issueDate: "2026-07-01",
    dueDate: "2026-07-03",
    daysOverdue: 21,
    description: "Bulk order — construction fittings, July restock",
    email: "REPLACE_ME.cust001@example.com",
  },
  {
    // Promise-breaker: promised a date and missed it. Proves outcome memory earns escalation.
    id: "INV-2077",
    customerId: "CUST-002",
    customerName: "Ceylon Spices Traders",
    amountDue: 180000,
    currency: "LKR",
    issueDate: "2026-06-10",
    dueDate: "2026-06-24",
    daysOverdue: 30,
    description: "Export consignment — cinnamon and pepper, June shipment",
    email: "REPLACE_ME.cust002@example.com",
  },
  {
    // Open-renewal: contract renewal imminent. Proves CRM context overrides aging-based
    // urgency even though this lateness is atypical for the customer.
    id: "INV-3140",
    customerId: "CUST-003",
    customerName: "Horizon Apparel Exports",
    amountDue: 320000,
    currency: "LKR",
    issueDate: "2026-06-24",
    dueDate: "2026-06-29",
    daysOverdue: 25,
    description: "Fabric supply — Q3 production run",
    email: "REPLACE_ME.cust003@example.com",
  },
  {
    // Reconciliation short-payment: Rs 95,500 received against Rs 100,000.
    // Proves the hypothesis-chain reasoning (bank fee? partial payment? withholding tax?).
    id: "INV-4002",
    customerId: "CUST-004",
    customerName: "Galle Marine Supplies",
    amountDue: 100000,
    amountReceived: 95500,
    currency: "LKR",
    issueDate: "2026-06-20",
    dueDate: "2026-07-04",
    daysOverdue: 0,
    description: "Marine hardware order, paid against invoice — Rs 4,500 short",
    email: "REPLACE_ME.cust004@example.com",
  },
  {
    // Low-confidence: deliberately ambiguous. Proves the agent escalates via ask_human
    // instead of guessing.
    id: "INV-5099",
    customerId: "CUST-005",
    customerName: "Nuwara Freight Logistics",
    amountDue: 150000,
    currency: "LKR",
    issueDate: "2026-06-14",
    dueDate: "2026-06-14",
    daysOverdue: 40,
    description: "Freight handling services, Q2",
    email: "REPLACE_ME.cust00@5example.com",
  },
];
