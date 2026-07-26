// Single source of truth for shared shapes. Nobody edits this file alone — see CLAUDE.md.

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  amountDue: number;
  amountReceived?: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  daysOverdue: number;
  description: string;
  disputeStatus?: "none" | "open" | "resolved";
}

export interface PaymentRecord {
  invoiceId: string;
  daysLate: number;
}

export interface PaymentPromise {
  madeOn: string;
  promisedPayDate: string;
  kept: boolean;
}

export interface OpenDeal {
  name: string;
  value: number;
  closeDate: string;
}

export interface CustomerHistory {
  customerId: string;
  customerName: string;
  relationshipYears: number;
  annualRevenue: number;
  paymentHistory: PaymentRecord[];
  openDeals: OpenDeal[];
  pastPromises: PaymentPromise[];
  notes: string;
}

export interface TrailStep {
  decisionId: string;
  stepIndex: number;
  toolName: string;
  input: unknown;
  output: unknown;
  timestamp: string;
  success: boolean;
}

export type DecisionStatus = "auto_executed" | "pending_approval" | "ask_human";

export interface Decision {
  id: string;
  invoiceId: string;
  customerId: string;
  goal: string;
  trail: TrailStep[];
  action: string;
  reasoning: string;
  manualProcedure: string[];
  confidence: number;
  escalationReason: string | null;
  status: DecisionStatus;
  createdAt: string;
}
