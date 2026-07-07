-- ============================================================================
-- PickleBuzz — 040_profile_boost_time_based.sql
-- Time-based profile boost: 15-day free (new users) + 30-day paid plan.
-- Run AFTER 039_profile_boost_impressions.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SCHEMA: replace impression budget with expiry-based boosts
-- ----------------------------------------------------------------------------

alter table public.profiles
  add column if not exists free_boost_granted boolean not null default false;

alter table public.profile_boosts
  add column if not exists boost_type text check (boost_type in ('free', 'paid')),
  add column if not exists started_at timestamptz,
  add column if not exists expires_at timestamptz,
  add column if not exists expiry_notified_at timestamptz;

-- Migrate any active impression boosts to a 30-day paid grace period.
update public.profile_boosts
set
  boost_type = 'paid',
  started_at = coalesce(activated_at, now()),
  expires_at = now() + interval '30 days'
where impressions_remaining > 0
  and (expires_at is null or expires_at <= now());

alter table public.profile_boosts
  drop column if exists impressions_remaining,
  drop column if exists activated_at;

drop index if exists idx_profile_boosts_active;

create index if not exists idx_profile_boosts_active_expiry
  on public.profile_boosts (expires_at desc)
  where expires_at is not null;

-- ----------------------------------------------------------------------------
-- 2. RLS: users may read their own boost status (days remaining, etc.)
-- ----------------------------------------------------------------------------

drop policy if exists "Users cannot read boost impressions" on public.profile_boosts;
drop policy if exists "Users read own boost" on public.profile_boosts;
create policy "Users read own boost"
  on public.profile_boosts
  for select
  using (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 3. SIGNUP: grant one-time 15-day free boost on account creation
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
    phone,
    profile_complete,
    free_boost_granted
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'city', ''),
    coalesce(
      (new.raw_user_meta_data ->> 'role')::public.user_role,
      'player'::public.user_role
    ),
    '3.0'::public.skill_level,
    3.00,
    null,
    false,
    true
  );

  insert into public.profile_boosts (user_id, boost_type, started_at, expires_at)
  values (new.id, 'free', now(), now() + interval '15 days');

  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 4. HELPERS
-- ----------------------------------------------------------------------------

create or replace function public.is_profile_boost_active(p_expires_at timestamptz)
returns boolean
language sql
stable
as $$
  select p_expires_at is not null and p_expires_at > now();
$$;

-- ----------------------------------------------------------------------------
-- 5. RPC: activate paid boost (30 days, starts immediately)
-- ----------------------------------------------------------------------------

create or replace function public.activate_paid_profile_boost(
  p_days int default 30
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_days int := greatest(coalesce(p_days, 30), 1);
  v_base timestamptz;
  v_expires timestamptz;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select coalesce(expires_at, now())
    into v_base
  from public.profile_boosts
  where user_id = v_uid
    and boost_type = 'paid'
    and expires_at > now();

  if v_base is null or v_base < now() then
    v_base := now();
  end if;

  v_expires := v_base + (v_days || ' days')::interval;

  insert into public.profile_boosts (user_id, boost_type, started_at, expires_at, expiry_notified_at)
  values (v_uid, 'paid', now(), v_expires, null)
  on conflict (user_id) do update
    set boost_type = 'paid',
        started_at = now(),
        expires_at = v_expires,
        expiry_notified_at = null;

  return jsonb_build_object(
    'active', true,
    'status', 'paid',
    'expiresAt', v_expires,
    'daysRemaining', greatest(0, ceil(extract(epoch from (v_expires - now())) / 86400)::int)
  );
end;
$$;

-- ----------------------------------------------------------------------------
-- 6. RPC: boost status for current user (visible on profile)
-- ----------------------------------------------------------------------------

create or replace function public.get_my_profile_boost_status()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_admin_boosted boolean := false;
  v_boost_type text;
  v_expires timestamptz;
  v_days int;
  v_active boolean;
  v_status text;
begin
  if v_uid is null then
    return jsonb_build_object(
      'active', false,
      'status', 'none',
      'daysRemaining', 0,
      'expiresAt', null,
      'boostType', null
    );
  end if;

  select boosted into v_admin_boosted
  from public.profiles
  where id = v_uid;

  select boost_type, expires_at
    into v_boost_type, v_expires
  from public.profile_boosts
  where user_id = v_uid;

  v_active := coalesce(v_admin_boosted, false)
    or public.is_profile_boost_active(v_expires);

  if coalesce(v_admin_boosted, false)
     and (v_boost_type is null or not public.is_profile_boost_active(v_expires)) then
    v_status := 'paid';
    v_days := 30;
    v_expires := null;
  elsif public.is_profile_boost_active(v_expires) then
    v_status := v_boost_type;
    v_days := greatest(0, ceil(extract(epoch from (v_expires - now())) / 86400)::int);
  elsif v_boost_type is not null then
    v_status := 'expired';
    v_days := 0;
  else
    v_status := 'none';
    v_days := 0;
    v_expires := null;
  end if;

  return jsonb_build_object(
    'active', v_active,
    'status', v_status,
    'daysRemaining', v_days,
    'expiresAt', v_expires,
    'boostType', case when public.is_profile_boost_active(v_expires) then v_boost_type else null end
  );
end;
$$;

-- ----------------------------------------------------------------------------
-- 7. RPC: mark expiry notification sent (prevents duplicate alerts)
-- ----------------------------------------------------------------------------

create or replace function public.mark_profile_boost_expiry_notified()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profile_boosts
  set expiry_notified_at = now()
  where user_id = auth.uid()
    and expires_at > now()
    and expiry_notified_at is null;
end;
$$;

-- ----------------------------------------------------------------------------
-- 8. DROP legacy impression RPC
-- ----------------------------------------------------------------------------

drop function if exists public.activate_profile_boost(int);
drop function if exists public.consume_profile_boost_impressions(uuid[]);

grant execute on function public.activate_paid_profile_boost(int) to authenticated;
grant execute on function public.get_my_profile_boost_status() to authenticated;
grant execute on function public.mark_profile_boost_expiry_notified() to authenticated;

-- ----------------------------------------------------------------------------
-- 9. RPC: activate paid boost for a user (service/webhook; not client-callable)
-- ----------------------------------------------------------------------------

create or replace function public.activate_paid_profile_boost_for_user(
  p_user_id uuid,
  p_days int default 30
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_days int := greatest(coalesce(p_days, 30), 1);
  v_base timestamptz;
  v_expires timestamptz;
begin
  if p_user_id is null then
    return;
  end if;

  select coalesce(expires_at, now())
    into v_base
  from public.profile_boosts
  where user_id = p_user_id
    and boost_type = 'paid'
    and expires_at > now();

  if v_base is null or v_base < now() then
    v_base := now();
  end if;

  v_expires := v_base + (v_days || ' days')::interval;

  insert into public.profile_boosts (user_id, boost_type, started_at, expires_at, expiry_notified_at)
  values (p_user_id, 'paid', now(), v_expires, null)
  on conflict (user_id) do update
    set boost_type = 'paid',
        started_at = now(),
        expires_at = v_expires,
        expiry_notified_at = null;
end;
$$;

-- Only service role (webhooks / admin jobs).
revoke all on function public.activate_paid_profile_boost_for_user(uuid, int) from public;
grant execute on function public.activate_paid_profile_boost_for_user(uuid, int) to service_role;
