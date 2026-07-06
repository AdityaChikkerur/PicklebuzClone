-- ============================================================================
-- PickleBuzz — 014_match_invite_notifications.sql
-- Reliable phone lookup + match-invite notifications for opponents.
-- Run AFTER 013_remove_best_of_one.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PHONE LOOKUP RPC (indexed; avoids client-side scan of profiles)
-- ----------------------------------------------------------------------------

create or replace function public.lookup_profile_by_phone(p_phone text)
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  city text,
  skill_level text,
  dupr_rating numeric,
  phone text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.full_name,
    p.avatar_url,
    p.city,
    p.skill_level::text,
    p.dupr_rating,
    p.phone
  from public.profiles p
  where p.phone is not null
    and p.phone <> ''
    and public.normalize_phone(p.phone) = public.normalize_phone(p_phone)
  limit 1;
$$;

grant execute on function public.lookup_profile_by_phone(text) to authenticated;

-- ----------------------------------------------------------------------------
-- 2. NOTIFY OPPONENTS WHEN A PENDING INVITE ROW IS INSERTED
-- ----------------------------------------------------------------------------

create or replace function public.notify_match_player_invite()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match record;
  v_creator_name text;
  v_label text;
begin
  if new.player_id is null or new.invite_status <> 'pending' then
    return new;
  end if;

  select m.created_by, m.team_a_name, m.team_b_name
  into v_match
  from public.matches m
  where m.id = new.match_id;

  if not found or v_match.created_by is null then
    return new;
  end if;

  if new.player_id = v_match.created_by then
    return new;
  end if;

  select p.full_name
  into v_creator_name
  from public.profiles p
  where p.id = v_match.created_by;

  v_label := v_match.team_a_name || ' vs ' || v_match.team_b_name;

  insert into public.notifications (user_id, icon, text, link, read)
  values (
    new.player_id,
    'match_invite',
    coalesce(v_creator_name, 'A player') || ' invited you to play ' || v_label,
    '/match-invite/' || new.match_id::text,
    false
  );

  return new;
end;
$$;

drop trigger if exists on_match_player_invite_notify on public.match_players;

create trigger on_match_player_invite_notify
  after insert on public.match_players
  for each row
  execute function public.notify_match_player_invite();
