-- ============================================================================
-- PickleBuzz — 039_profile_boost_impressions.sql
-- Profile boost with hidden impression budget for Discover ranking.
-- Run AFTER 038_major_cities_venues.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. BOOST STATE (impressions hidden from public profile reads)
-- ----------------------------------------------------------------------------

create table if not exists public.profile_boosts (
  user_id               uuid primary key references public.profiles(id) on delete cascade,
  impressions_remaining int not null default 0 check (impressions_remaining >= 0),
  activated_at            timestamptz,
  created_at              timestamptz not null default now()
);

create index if not exists idx_profile_boosts_active
  on public.profile_boosts (impressions_remaining desc)
  where impressions_remaining > 0;

alter table public.profile_boosts enable row level security;

-- No direct client writes; activation and consumption go through RPC.

drop policy if exists "Users cannot read boost impressions" on public.profile_boosts;
create policy "Users cannot read boost impressions"
  on public.profile_boosts
  for select
  using (false);

-- ----------------------------------------------------------------------------
-- 2. LOCK BOOST COLUMNS ON PROFILES (admin-only boosted flag)
-- ----------------------------------------------------------------------------

create or replace function public.enforce_profile_boost_security()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and not public.is_admin() then
    new.boosted := old.boosted;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_boost_security on public.profiles;
create trigger profiles_boost_security
  before update on public.profiles
  for each row
  execute function public.enforce_profile_boost_security();

-- ----------------------------------------------------------------------------
-- 3. RPC: activate boost (60 impressions, free trial)
-- ----------------------------------------------------------------------------

create or replace function public.activate_profile_boost(
  p_impressions int default 60
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_remaining int;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select impressions_remaining
    into v_remaining
  from public.profile_boosts
  where user_id = v_uid;

  if coalesce(v_remaining, 0) > 0 then
    return jsonb_build_object('active', true, 'already_active', true);
  end if;

  insert into public.profile_boosts (user_id, impressions_remaining, activated_at)
  values (v_uid, greatest(p_impressions, 1), now())
  on conflict (user_id) do update
    set impressions_remaining = greatest(p_impressions, 1),
        activated_at = now();

  return jsonb_build_object('active', true, 'activated', true);
end;
$$;

-- ----------------------------------------------------------------------------
-- 4. RPC: consume impressions after a Discover feed view
-- ----------------------------------------------------------------------------

create or replace function public.consume_profile_boost_impressions(
  p_profile_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_profile_ids is null or cardinality(p_profile_ids) = 0 then
    return;
  end if;

  update public.profile_boosts
  set impressions_remaining = greatest(impressions_remaining - 1, 0)
  where user_id = any(p_profile_ids)
    and impressions_remaining > 0;
end;
$$;

-- ----------------------------------------------------------------------------
-- 5. RPC: boost status for current user (no impression count exposed)
-- ----------------------------------------------------------------------------

create or replace function public.get_my_profile_boost_status()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'active',
    coalesce(
      (
        select impressions_remaining > 0
        from public.profile_boosts
        where user_id = auth.uid()
      ),
      false
    )
    or coalesce(
      (
        select boosted
        from public.profiles
        where id = auth.uid()
      ),
      false
    )
  );
$$;

grant execute on function public.activate_profile_boost(int) to authenticated;
grant execute on function public.consume_profile_boost_impressions(uuid[]) to authenticated, anon;
grant execute on function public.get_my_profile_boost_status() to authenticated;
