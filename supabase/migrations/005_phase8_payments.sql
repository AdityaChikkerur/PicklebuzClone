-- Phase 8 — real payments (Razorpay) + rename payments_placeholder → payments
-- Run after 004_phase6_admin_flags.sql

-- Extend status enum values and add gateway columns
alter table public.payments_placeholder
  add column if not exists gateway text not null default 'placeholder'
    check (gateway in ('placeholder', 'razorpay')),
  add column if not exists gateway_order_id text,
  add column if not exists gateway_payment_id text,
  add column if not exists currency text not null default 'INR';

-- Allow failed status for gateway payments
alter table public.payments_placeholder
  drop constraint if exists payments_placeholder_status_check;

alter table public.payments_placeholder
  add constraint payments_placeholder_status_check
  check (status in ('pending', 'paid', 'failed'));

create unique index if not exists idx_payments_gateway_order
  on public.payments_placeholder (gateway_order_id)
  where gateway_order_id is not null;

create index if not exists idx_payments_user_kind
  on public.payments_placeholder (user_id, kind, status);

-- Rename to reflect real gateway support (code references updated in Phase 8)
alter table public.payments_placeholder rename to payments;

-- Webhook / service role needs to update payment status by order id
drop policy if exists "payments own" on public.payments;
create policy "payments own" on public.payments for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- Service role (webhooks) bypasses RLS; grant authenticated unchanged
grant select, insert, update on public.payments to authenticated;
