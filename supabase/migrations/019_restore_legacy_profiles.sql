-- ============================================================================
-- PickleBuzz — 019_restore_legacy_profiles.sql
-- Restore access for pre-onboarding accounts (~60 early signups).
-- Run AFTER 018_cleanup_demo_tournaments.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Backfill Google profile photos from auth metadata
-- ----------------------------------------------------------------------------

update public.profiles p
set avatar_url = coalesce(
  u.raw_user_meta_data ->> 'picture',
  u.raw_user_meta_data ->> 'avatar_url'
)
from auth.users u
where p.id = u.id
  and (p.avatar_url is null or p.avatar_url = '')
  and coalesce(
    u.raw_user_meta_data ->> 'picture',
    u.raw_user_meta_data ->> 'avatar_url'
  ) is not null;

-- ----------------------------------------------------------------------------
-- 2. Repair missing profile rows (auth user exists but no profiles row)
-- ----------------------------------------------------------------------------

insert into public.profiles (
  id,
  full_name,
  email,
  city,
  role,
  skill_level,
  dupr_rating,
  avatar_url,
  phone,
  profile_complete
)
select
  u.id,
  coalesce(
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'name',
    split_part(u.email, '@', 1),
    ''
  ),
  u.email,
  coalesce(u.raw_user_meta_data ->> 'city', ''),
  coalesce(
    (u.raw_user_meta_data ->> 'role')::public.user_role,
    'player'::public.user_role
  ),
  '3.0'::public.skill_level,
  3.00,
  coalesce(
    u.raw_user_meta_data ->> 'picture',
    u.raw_user_meta_data ->> 'avatar_url'
  ),
  null,
  true
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 3. Grandfather active legacy accounts (skip forced re-onboarding)
-- ----------------------------------------------------------------------------

update public.profiles p
set profile_complete = true
where p.profile_complete = false
  and (
    exists (
      select 1
      from public.match_players mp
      where mp.player_id = p.id
    )
    or exists (
      select 1
      from public.matches m
      where m.created_by = p.id
    )
    or exists (
      select 1
      from public.tournament_registrations tr
      where tr.player_id = p.id
    )
    or exists (
      select 1
      from public.tournaments t
      where t.created_by = p.id
    )
    or (
      nullif(trim(p.full_name), '') is not null
      and nullif(trim(p.city), '') is not null
      and nullif(trim(p.avatar_url), '') is not null
    )
    or (
      nullif(trim(p.full_name), '') is not null
      and p.created_at < '2026-03-01'::timestamptz
    )
  );

-- ----------------------------------------------------------------------------
-- 4. Signup trigger — copy Google avatar for new users
-- ----------------------------------------------------------------------------

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
    dupr_rating,
    avatar_url,
    phone,
    profile_complete
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1),
      ''
    ),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'city', ''),
    coalesce(
      (new.raw_user_meta_data ->> 'role')::public.user_role,
      'player'::public.user_role
    ),
    '3.0'::public.skill_level,
    3.00,
    coalesce(
      new.raw_user_meta_data ->> 'picture',
      new.raw_user_meta_data ->> 'avatar_url'
    ),
    null,
    false
  );
  return new;
end;
$$;
