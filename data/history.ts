import type { CustomerHistory } from "../lib/types.js";

export interface PaymentTransaction {
  invoiceId: string;
  customerId: string;
  amountDue: number;
  amountReceived: number;
  shortfallReason: "bank_fee" | "withholding_tax" | "partial_payment" | "unexplained";
  confirmedByCustomer: boolean;
}

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

  // Ledger padding (CUST-006 onward) — paired 1:1 with the padding invoices in data/seed.ts.
  {
    customerId: "CUST-006",
    customerName: "Colombo Steel Works",
    relationshipYears: 4,
    annualRevenue: 540000,
    paymentHistory: [
      { invoiceId: "INV-5810", daysLate: 5 },
      { invoiceId: "INV-5902", daysLate: 6 },
    ],
    openDeals: [],
    pastPromises: [],
    notes: "Pays within a week of terms, consistently. Nothing unusual on file.",
  },
  {
    customerId: "CUST-007",
    customerName: "Kandy Tea Exporters",
    relationshipYears: 6,
    annualRevenue: 1900000,
    paymentHistory: [
      { invoiceId: "INV-5811", daysLate: 20 },
      { invoiceId: "INV-5903", daysLate: 22 },
    ],
    openDeals: [],
    pastPromises: [],
    notes: "Regularly runs 20-25 days late — normal cadence for this account, not a warning sign.",
  },
  {
    customerId: "CUST-008",
    customerName: "Negombo Fisheries Co-op",
    relationshipYears: 2,
    annualRevenue: 310000,
    paymentHistory: [{ invoiceId: "INV-5812", daysLate: 1 }],
    openDeals: [],
    pastPromises: [],
    notes: "Small, reliable account. Pays on or near terms.",
  },
  {
    customerId: "CUST-009",
    customerName: "Jaffna Agro Distributors",
    relationshipYears: 3,
    annualRevenue: 720000,
    paymentHistory: [
      { invoiceId: "INV-5813", daysLate: 35 },
      { invoiceId: "INV-5904", daysLate: 40 },
    ],
    openDeals: [],
    pastPromises: [],
    notes: "Consistently 35-40 days late — this is their normal pattern, not a change in risk.",
  },
  {
    customerId: "CUST-010",
    customerName: "Matara Textiles Ltd",
    relationshipYears: 5,
    annualRevenue: 480000,
    paymentHistory: [{ invoiceId: "INV-5814", daysLate: 4 }],
    openDeals: [],
    pastPromises: [],
    notes: "Reliable near-on-time payer.",
  },
  {
    customerId: "CUST-011",
    customerName: "Batticaloa Rice Millers",
    relationshipYears: 7,
    annualRevenue: 1100000,
    paymentHistory: [
      { invoiceId: "INV-5815", daysLate: 22 },
      { invoiceId: "INV-5905", daysLate: 25 },
    ],
    openDeals: [
      { name: "Annual milling supply renewal", value: 1100000, closeDate: "2026-09-15" },
    ],
    pastPromises: [],
    notes: "Habitually 20-25 days late — normal for this account. Renewal open in ~7 weeks.",
  },
  {
    customerId: "CUST-012",
    customerName: "Anuradhapura Ceramics",
    relationshipYears: 1,
    annualRevenue: 210000,
    paymentHistory: [{ invoiceId: "INV-5816", daysLate: 0 }],
    openDeals: [],
    pastPromises: [],
    notes: "New account, first invoices paid on time.",
  },
  {
    customerId: "CUST-013",
    customerName: "Trincomalee Marine Charters",
    relationshipYears: 4,
    annualRevenue: 1500000,
    paymentHistory: [{ invoiceId: "INV-5817", daysLate: 8 }],
    openDeals: [],
    pastPromises: [],
    notes:
      "Current invoice is under an open dispute — customer claims charter hours were " +
      "over-billed. Do not send a reminder; check dispute evidence first.",
  },
  {
    customerId: "CUST-014",
    customerName: "Kurunegala Coconut Millers",
    relationshipYears: 3,
    annualRevenue: 390000,
    paymentHistory: [{ invoiceId: "INV-5818", daysLate: 2 }],
    openDeals: [],
    pastPromises: [],
    notes: "Small reliable account, not yet due.",
  },
  {
    customerId: "CUST-015",
    customerName: "Ratnapura Gem Exporters",
    relationshipYears: 9,
    annualRevenue: 3200000,
    paymentHistory: [
      { invoiceId: "INV-5819", daysLate: 18 },
      { invoiceId: "INV-5906", daysLate: 15 },
    ],
    openDeals: [
      { name: "Export partnership expansion", value: 900000, closeDate: "2026-10-01" },
    ],
    pastPromises: [],
    notes: "Large, long-standing account. Typically 15-20 days late; renewal-adjacent deal open.",
  },
  {
    customerId: "CUST-016",
    customerName: "Galewela Dairy Farms",
    relationshipYears: 2,
    annualRevenue: 180000,
    paymentHistory: [{ invoiceId: "INV-5820", daysLate: 0 }],
    openDeals: [],
    pastPromises: [],
    notes: "Small account, not yet due.",
  },
  {
    customerId: "CUST-017",
    customerName: "Badulla Tea Processors",
    relationshipYears: 6,
    annualRevenue: 980000,
    paymentHistory: [
      { invoiceId: "INV-5821", daysLate: 24 },
      { invoiceId: "INV-5907", daysLate: 28 },
    ],
    openDeals: [],
    pastPromises: [],
    notes: "Habitually 24-28 days late — normal cadence for this account.",
  },
  {
    customerId: "CUST-018",
    customerName: "Puttalam Salt Works",
    relationshipYears: 3,
    annualRevenue: 340000,
    paymentHistory: [{ invoiceId: "INV-5822", daysLate: 9 }],
    openDeals: [],
    pastPromises: [],
    notes: "Pays roughly a week and a half late, consistently.",
  },
  {
    customerId: "CUST-019",
    customerName: "Ampara Paddy Cooperative",
    relationshipYears: 4,
    annualRevenue: 610000,
    paymentHistory: [
      { invoiceId: "INV-5823", daysLate: 20 },
      { invoiceId: "INV-5908", daysLate: 24 },
    ],
    openDeals: [],
    pastPromises: [
      { madeOn: "2026-06-20", promisedPayDate: "2026-06-27", kept: true },
    ],
    notes: "Habitually late but keeps its promises when it makes them.",
  },
  {
    customerId: "CUST-020",
    customerName: "Chilaw Poultry Distributors",
    relationshipYears: 2,
    annualRevenue: 260000,
    paymentHistory: [{ invoiceId: "INV-5824", daysLate: 5 }],
    openDeals: [],
    pastPromises: [],
    notes: "Small account, mildly late but consistent.",
  },
  {
    customerId: "CUST-021",
    customerName: "Monaragala Cashew Processors",
    relationshipYears: 5,
    annualRevenue: 700000,
    paymentHistory: [{ invoiceId: "INV-5825", daysLate: 0 }],
    openDeals: [],
    pastPromises: [],
    notes:
      "Reliable payer. Current payment arrived Rs 2,000 short — see payment transactions, " +
      "consistent with their usual bank transfer fee.",
  },
  {
    customerId: "CUST-022",
    customerName: "Vavuniya Timber Traders",
    relationshipYears: 3,
    annualRevenue: 420000,
    paymentHistory: [{ invoiceId: "INV-5826", daysLate: 3 }],
    openDeals: [],
    pastPromises: [],
    notes: "Small reliable account.",
  },
  {
    customerId: "CUST-023",
    customerName: "Hambantota Port Logistics",
    relationshipYears: 8,
    annualRevenue: 2100000,
    paymentHistory: [
      { invoiceId: "INV-5827", daysLate: 30 },
      { invoiceId: "INV-5909", daysLate: 33 },
    ],
    openDeals: [
      { name: "Multi-year logistics contract renewal", value: 2100000, closeDate: "2026-08-20" },
    ],
    pastPromises: [],
    notes: "Large account, habitually 30-33 days late. Renewal negotiation in progress.",
  },
  {
    customerId: "CUST-024",
    customerName: "Polonnaruwa Irrigation Supplies",
    relationshipYears: 2,
    annualRevenue: 230000,
    paymentHistory: [{ invoiceId: "INV-5828", daysLate: 1 }],
    openDeals: [],
    pastPromises: [],
    notes: "Small account, essentially on time.",
  },
  {
    customerId: "CUST-025",
    customerName: "Gampaha Electronics Assembly",
    relationshipYears: 3,
    annualRevenue: 890000,
    paymentHistory: [
      { invoiceId: "INV-5829", daysLate: 20 },
      { invoiceId: "INV-5910", daysLate: 26 },
    ],
    openDeals: [],
    pastPromises: [
      { madeOn: "2026-06-16", promisedPayDate: "2026-06-23", kept: false },
    ],
    notes: "Promised payment on 2026-06-16 for a prior invoice by 2026-06-23; missed it.",
  },
];

// Payments/Stripe-PayHere transaction history. Deliberately has no record matching the
// current INV-4002 shortfall — the reconciliation scenario must stay ambiguous, not be
// resolved by a lookup.
export const paymentTransactions: PaymentTransaction[] = [
  { invoiceId: "INV-3311", customerId: "CUST-004", amountDue: 50000, amountReceived: 49500, shortfallReason: "bank_fee", confirmedByCustomer: true },
  { invoiceId: "INV-3402", customerId: "CUST-004", amountDue: 60000, amountReceived: 55000, shortfallReason: "withholding_tax", confirmedByCustomer: true },
  { invoiceId: "INV-6016", customerId: "CUST-021", amountDue: 152000, amountReceived: 150000, shortfallReason: "bank_fee", confirmedByCustomer: true },
];

export interface DisputeEvidence {
  invoiceId: string;
  purchaseOrderStatus: "matched" | "mismatched" | "not_found";
  purchaseOrderNotes: string;
  deliveryConfirmed: boolean;
  deliveryNotes: string;
}

// Evidence for the quality-complaint dispute referenced in CUST-005's notes above (the past
// INV-4880, not the current seeded INV-5099) — reused as the fixture so the 5 locked scenarios
// in data/seed.ts stay untouched.
export const disputeEvidence: DisputeEvidence[] = [
  {
    invoiceId: "INV-4880",
    purchaseOrderStatus: "matched",
    purchaseOrderNotes: "PO-4880 matches the invoiced line items and quantities.",
    deliveryConfirmed: true,
    deliveryNotes:
      "Delivery confirmed by signed proof-of-delivery. The complaint was about damaged goods " +
      "on arrival, not non-delivery.",
  },
];
