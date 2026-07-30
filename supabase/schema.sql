create extension if not exists pgcrypto;

create table invoices (
  id text primary key,
  customer_id text not null,
  customer_name text not null,
  amount_due numeric not null,
  amount_received numeric,
  currency text not null,
  issue_date date not null,
  due_date date not null,
  days_overdue integer not null,
  description text not null,
  dispute_status text default 'none' check (dispute_status in ('none', 'open', 'resolved')),
  email text not null
);

create table decisions (
  id text primary key,
  invoice_id text not null,
  customer_id text not null,
  goal text not null,
  action text not null,
  reasoning text not null,
  manual_procedure text[] not null,
  confidence numeric not null,
  escalation_reason text,
  status text not null check (status in ('auto_executed', 'pending_approval', 'ask_human')),
  created_at timestamptz not null default now(),
  run_id text
);

create table trail_steps (
  decision_id text not null references decisions(id) on delete cascade,
  step_index integer not null,
  tool_name text not null,
  input jsonb,
  output jsonb,
  timestamp timestamptz not null,
  success boolean not null,
  primary key (decision_id, step_index)
);

create table human_actions (
  id bigint generated always as identity primary key,
  decision_id text not null references decisions(id),
  action_type text not null check (action_type in ('approve', 'edit', 'redirect', 'override')),
  edited_action text,
  edited_reasoning text,
  human_note text,
  created_at timestamptz not null default now()
);

create index on decisions (status);
create index on trail_steps (decision_id);
create index on human_actions (decision_id);

-- Present in the live Supabase project but never read or written by any code path (data/history.ts
-- is the actual, in-memory source for this data). Documented here for completeness; safe to ignore
-- or drop if the CRM/payment-history migration into Supabase never happens.
create table customers (
  customer_id text primary key,
  customer_name text not null,
  relationship_years integer not null,
  annual_revenue numeric not null,
  notes text
);

create table open_deals (
  id bigint generated always as identity primary key,
  customer_id text not null references customers(customer_id),
  name text not null,
  value numeric not null,
  close_date date not null
);

create table payment_history (
  id bigint generated always as identity primary key,
  customer_id text not null references customers(customer_id),
  invoice_id text not null,
  days_late integer not null
);

create table payment_promises (
  id bigint generated always as identity primary key,
  customer_id text not null references customers(customer_id),
  made_on date not null,
  promised_pay_date date not null,
  kept boolean not null
);

-- decisions.invoice_id and decisions.customer_id are deliberately NOT foreign keys to
-- invoices.id / customers.customer_id: no code path in this repo ever inserts rows into
-- invoices or customers (lib/invoices.ts falls back to in-memory seed data whenever the
-- invoices table is empty or unreachable), so a decision can legitimately reference an
-- invoice/customer ID that was never written to those tables. The live project had both FKs
-- and every decision insert was failing as a result; they were dropped on 2026-07-31.
