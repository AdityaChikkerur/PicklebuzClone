-- ============================================================================
-- PickleBuzz — 023_doubles_mixed_invite_rules.sql
-- Doubles / mixed doubles: creator's team auto-confirms; at least one
-- registered opponent must accept before the match is playable and recorded.
-- Singles keeps the existing rule (all registered players must accept).
-- Run AFTER 022_cancel_match_no_events.sql.
-- ============================================================================

create or replace function public.match_all_invites_accepted(p_match_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_match record;
  v_creator_team public.team_side;
begin
  select m.match_type, m.created_by
  into v_match
  from public.matches m
  where m.id = p_match_id;

  if not found then
    return false;
  end if;

  -- Singles: every registered player must accept.
  if v_match.match_type = 'singles' then
    return not exists (
      select 1
      from public.match_players mp
      where mp.match_id = p_match_id
        and mp.player_id is not null
        and mp.invite_status <> 'accepted'
    );
  end if;

  -- Doubles / mixed: creator's team is confirmed at setup; one opponent
  -- accepting is enough to start scoring and record the result.
  select mp.team
  into v_creator_team
  from public.match_players mp
  where mp.match_id = p_match_id
    and mp.player_id = v_match.created_by
  limit 1;

  if v_creator_team is null then
    return false;
  end if;

  return exists (
    select 1
    from public.match_players mp
    where mp.match_id = p_match_id
      and mp.team <> v_creator_team
      and mp.player_id is not null
      and mp.invite_status = 'accepted'
  );
end;
$$;

-- When one opponent accepts a doubles/mixed invite, auto-accept remaining
-- pending registered players on the same opposing team so the roster is clean.
create or replace function public.respond_match_player_invite(
  p_match_id uuid,
  p_accept boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_match record;
  v_responder_team public.team_side;
  v_started boolean := false;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select id, status, created_by, match_type, team_a_name, team_b_name
  into v_match
  from public.matches
  where id = p_match_id;

  if not found then
    raise exception 'Match not found';
  end if;

  select team
  into v_responder_team
  from public.match_players
  where match_id = p_match_id
    and player_id = v_uid
    and invite_status = 'pending';

  update public.match_players
  set
    invite_status = case when p_accept then 'accepted' else 'declined' end,
    responded_at = now()
  where match_id = p_match_id
    and player_id = v_uid
    and invite_status = 'pending';

  if not found then
    raise exception 'No pending invite found for this match';
  end if;

  if p_accept and v_match.match_type <> 'singles' and v_responder_team is not null then
    update public.match_players
    set
      invite_status = 'accepted',
      responded_at = coalesce(responded_at, now())
    where match_id = p_match_id
      and team = v_responder_team
      and player_id is not null
      and invite_status = 'pending';
  end if;

  if p_accept then
    v_started := public.try_activate_match(p_match_id);
  end if;

  return jsonb_build_object(
    'accepted', p_accept,
    'match_started', v_started,
    'match_status', (select status from public.matches where id = p_match_id)
  );
end;
$$;
