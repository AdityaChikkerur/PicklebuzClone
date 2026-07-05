-- PickleBuzz — 009 payment status security
-- Prevent authenticated users from marking their own payments as paid (Razorpay bypass).
-- Run AFTER 008_role_security.sql

create or replace function public.enforce_payment_status_security()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Service role (webhooks) and admins may change payment status.
  if coalesce(auth.jwt() ->> 'role', '') = 'service_role' then
    return new;
  end if;

  if public.is_admin() then
    return new;
  end if;

  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    raise exception 'payment status cannot be changed by user';
  end if;

  return new;
end;
$$;

drop trigger if exists payments_status_security on public.payments;
create trigger payments_status_security
  before update on public.payments
  for each row
  execute function public.enforce_payment_status_security();
