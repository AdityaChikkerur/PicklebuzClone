-- ============================================================================
-- PickleBuzz — 004_phase6_admin_flags.sql (Phase 6)
-- Admin flags on profiles & tournaments; admin RLS for staff dashboards.
-- Run AFTER 003_phase2_has_referee.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROFILE ADMIN FLAGS
-- ----------------------------------------------------------------------------

alter table public.profiles
  add column if not exists email text,
  add column if not exists verified boolean not null default false,
  add column if not exists banned boolean not null default false,
  add column if not exists boosted boolean not null default false;

-- Backfill email from auth.users for existing accounts.
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and (p.email is null or p.email = '');

-- Keep email in sync on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    city,
    role,
    skill_level,
    dupr_rating
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'city', ''),
    coalesce(
      (new.raw_user_meta_data ->> 'role')::public.user_role,
      'player'::public.user_role
    ),
    coalesce(
      (new.raw_user_meta_data ->> 'skill_level')::public.skill_level,
      '3.0'::public.skill_level
    ),
    3.00
  );
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 2. TOURNAMENT ADMIN FLAGS
-- ----------------------------------------------------------------------------

alter table public.tournaments
  add column if not exists featured boolean not null default false,
  add column if not exists archived boolean not null default false;

create index if not exists idx_tournaments_featured
  on public.tournaments (featured)
  where featured = true and archived = false;

-- ----------------------------------------------------------------------------
-- 3. ADMIN RLS POLICIES
-- ----------------------------------------------------------------------------

drop policy if exists "Admin can update any profile" on public.profiles;
create policy "Admin can update any profile"
  on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin can read all tournaments" on public.tournaments;
create policy "Admin can read all tournaments"
  on public.tournaments
  for select
  using (public.is_admin());

drop policy if exists "Admin can update any tournament" on public.tournaments;
create policy "Admin can update any tournament"
  on public.tournaments
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin can read all matches" on public.matches;
create policy "Admin can read all matches"
  on public.matches
  for select
  using (public.is_admin());

drop policy if exists "Admin can update any match" on public.matches;
create policy "Admin can update any match"
  on public.matches
  for update
  using (public.is_admin())
  with check (public.is_admin());
