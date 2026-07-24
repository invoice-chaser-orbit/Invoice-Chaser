import type { CustomerHistory } from "../lib/types.js";

// CRM + payment history the tools read from. Paired 1:1 with data/seed.ts by customerId.

export const customerHistories: CustomerHistory[] = [
  {
    customerId: "CUST-001",
    customerName: "Lanka Hardware (Pvt) Ltd",
    relationshipYears: 8,
    annualRevenue: 2400000,
    paymentHistory: [
      { invoiceId: "INV-0891", daysLate: 12 },
      { invoiceId: "INV-0940", daysLate: 14 },
      { invoiceId: "INV-0988", daysLate: 11 },
      { invoiceId: "INV-1005", daysLate: 15 },
      { invoiceId: "INV-1021", daysLate: 10 },
    ],
    openDeals: [
      { name: "Annual supply contract renewal", value: 2400000, closeDate: "2026-09-04" },
    ],
    pastPromises: [],
    notes:
      "Eight-year account. Consistently pays 10-15 days after terms — this is their normal " +
      "cadence, not a warning sign. No dispute history. Renewal due in ~6 weeks.",
  },
  {
    customerId: "CUST-002",
    customerName: "Ceylon Spices Traders",
    relationshipYears: 3,
    annualRevenue: 600000,
    paymentHistory: [
      { invoiceId: "INV-1810", daysLate: 3 },
      { invoiceId: "INV-1922", daysLate: 5 },
      { invoiceId: "INV-2001", daysLate: 4 },
    ],
    openDeals: [],
    pastPromises: [
      { madeOn: "2026-07-01", promisedPayDate: "2026-07-08", kept: false },
    ],
    notes:
      "Normally pays within a week of terms. On 2026-07-01 promised payment of INV-2077 by " +
      "2026-07-08 in an email reply; no payment or further contact since. No open deals.",
  },
  {
    customerId: "CUST-003",
    customerName: "Horizon Apparel Exports",
    relationshipYears: 2,
    annualRevenue: 1800000,
    paymentHistory: [
      { invoiceId: "INV-2704", daysLate: 0 },
      { invoiceId: "INV-2855", daysLate: 2 },
      { invoiceId: "INV-2990", daysLate: 1 },
    ],
    openDeals: [
      { name: "Annual fabric supply renewal — currently under procurement negotiation", value: 1800000, closeDate: "2026-08-03" },
    ],
    pastPromises: [],
    notes:
      "Historically pays on or near terms — this 25-day lateness is atypical for them. " +
      "Renewal terms are actively being negotiated with their procurement team; a firm notice " +
      "now risks a contract worth 1.8M/year over a single late invoice.",
  },
  {
    customerId: "CUST-004",
    customerName: "Galle Marine Supplies",
    relationshipYears: 5,
    annualRevenue: 900000,
    paymentHistory: [
      { invoiceId: "INV-3311", daysLate: 0 },
      { invoiceId: "INV-3402", daysLate: 1 },
      { invoiceId: "INV-3560", daysLate: 0 },
    ],
    openDeals: [],
    pastPromises: [],
    notes:
      "Reliable, near-always-on-time payer. Twice before, their payment arrived short of the " +
      "invoice total: once by ~Rs 500 (their bank's outward transfer fee), once by ~Rs 5,000 " +
      "(withholding tax deduction, confirmed by the customer by email afterward). No dispute " +
      "on file for the current invoice.",
  },
  {
    customerId: "CUST-005",
    customerName: "Nuwara Freight Logistics",
    relationshipYears: 1,
    annualRevenue: 400000,
    paymentHistory: [
      { invoiceId: "INV-4700", daysLate: -3 },
      { invoiceId: "INV-4820", daysLate: 52 },
      { invoiceId: "INV-4855", daysLate: 0 },
      { invoiceId: "INV-4880", daysLate: 61 },
      { invoiceId: "INV-4930", daysLate: 8 },
    ],
    openDeals: [],
    pastPromises: [],
    notes:
      "Payment timing has no discernible pattern (ranges from early to 61 days late). A quality " +
      "complaint dispute was opened three months ago against INV-4880; the system does not " +
      "record whether it was resolved, or whether it relates to the current invoice. Insufficient " +
      "reliable signal to judge tone or urgency with confidence.",
  },
];
