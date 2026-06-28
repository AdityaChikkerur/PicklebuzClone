-- PickleBuzz — 008 role security (prevent self-assigning admin / changing role after onboarding)
-- Run AFTER 007_production_onboarding.sql

create or replace function public.enforce_profile_role_security()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only existing admins (or service role) may hold or assign the admin role.
  if new.role = 'admin'::public.user_role and not public.is_admin() then
    new.role := coalesce(old.role, 'player'::public.user_role);
  end if;

  -- After onboarding, users cannot change their own role.
  if tg_op = 'UPDATE'
     and old.profile_complete = true
     and new.role is distinct from old.role
     and not public.is_admin() then
    new.role := old.role;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_role_security on public.profiles;
create trigger profiles_role_security
  before insert or update on public.profiles
  for each row
  execute function public.enforce_profile_role_security();
