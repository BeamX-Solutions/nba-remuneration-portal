-- ============================================================
-- Migration 002: Admin Roles, Audit Logs, Payments
-- Run this in the Supabase SQL Editor after 001_initial_schema.sql
-- ============================================================

-- ─────────────────────────────────────────
-- ADMIN FLAG ON PROFILES
-- ─────────────────────────────────────────
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- ─────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────
create table if not exists public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  admin_id     uuid references auth.users(id) on delete set null,
  action       text not null,
  entity_type  text not null,
  entity_id    text,
  details      jsonb,
  created_at   timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

create policy "Authenticated users can insert audit logs"
  on public.audit_logs for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can view audit logs"
  on public.audit_logs for select
  using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
-- PAYMENTS
-- ─────────────────────────────────────────
create table if not exists public.payments (
  id              uuid primary key default gen_random_uuid(),
  document_id     uuid references public.documents(id) on delete cascade not null,
  user_id         uuid references auth.users(id) on delete cascade not null,
  amount          numeric(15, 2) not null,
  payment_method  text not null default 'secretariat',
  reference       text,
  notes           text,
  recorded_by     uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "Users can view own payments"
  on public.payments for select
  using (auth.uid() = user_id);

create policy "Authenticated users can view all payments"
  on public.payments for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert payments"
  on public.payments for insert
  with check (auth.role() = 'authenticated');
