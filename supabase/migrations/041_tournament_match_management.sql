-- ============================================================================
-- PickleBuzz — 041_tournament_match_management.sql
-- Fixture scheduling, organizer match outcomes (walkover, no-show, cancel,
-- abandon), tournament status updates, and co-admin match cancellation.
-- Run AFTER 040_profile_boost_time_based.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. FIXTURE SCHEDULING + OUTCOME COLUMNS
-- ----------------------------------------------------------------------------

alter table public.fixtures
  add column if not exists scheduled_at timestamptz,
  add column if not exists court text,
  add column if not exists outcome text
    check (outcome is null or outcome in ('walkover', 'no_show', 'cancelled', 'abandoned')),
  add column if not exists outcome_winner public.team_side,
  add column if not exists outcome_notes text;

create index if not exists idx_fixtures_scheduled_at
  on public.fixtures (tournament_id, scheduled_at)
  where scheduled_at is not null;

-- ----------------------------------------------------------------------------
-- 2. MATCH STATUS — cancelled + walkover for tournament outcomes
-- ----------------------------------------------------------------------------

alter type public.match_status add value if not exists 'cancelled';
alter type public.match_status add value if not exists 'walkover';

-- ----------------------------------------------------------------------------
-- 3. INTERNAL — propagate knockout winner (mirrors fixtures.ts)
-- ----------------------------------------------------------------------------

create or replace function public.propagate_knockout_winner(
  p_fixture_id uuid,
  p_winner_name text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fixture record;
  v_round text;
  v_index int;
  v_next_round text;
  v_target_index int;
  v_slot text;
  v_target record;
  v_current text;
begin
  select id, tournament_id, category_id, round
  into v_fixture
  from public.fixtures
  where id = p_fixture_id;

  if not found then return; end if;

  v_round := coalesce(v_fixture.round, '');
  if v_round = '' or v_round = 'RR' then return; end if;

  select ordinality - 1
  into v_index
  from (
    select id, row_number() over (order by created_at asc) as ordinality
    from public.fixtures
    where tournament_id = v_fixture.tournament_id
      and category_id = v_fixture.category_id
      and round = v_round
  ) sub
  where id = p_fixture_id;

  if v_index is null then return; end if;

  v_next_round := case v_round
    when 'R64' then 'R32'
    when 'R32' then 'R16'
    when 'R16' then 'QF'
    when 'QF' then 'SF'
    when 'SF' then 'Final'
    else null
  end;

  if v_next_round is null then return; end if;

  v_target_index := floor(v_index / 2.0);
  v_slot := case when v_index % 2 = 0 then 'team_a' else 'team_b' end;

  select id, team_a, team_b
  into v_target
  from (
    select id, team_a, team_b, row_number() over (order by created_at asc) - 1 as idx
    from public.fixtures
    where tournament_id = v_fixture.tournament_id
      and category_id = v_fixture.category_id
      and round = v_next_round
  ) sub
  where idx = v_target_index;

  if not found then return; end if;

  v_current := case v_slot when 'team_a' then v_target.team_a else v_target.team_b end;
  if v_current is not null and v_current <> 'TBD' then return; end if;

  execute format(
    'update public.fixtures set %I = $1 where id = $2',
    v_slot
  ) using p_winner_name, v_target.id;
end;
$$;

-- ----------------------------------------------------------------------------
-- 4. INTERNAL — update points table + recompute rankings
-- ----------------------------------------------------------------------------

create or replace function public.apply_fixture_points_result(
  p_tournament_id uuid,
  p_category_id uuid,
  p_team_a text,
  p_team_b text,
  p_points_a integer,
  p_points_b integer,
  p_winner_key text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team record;
  v_is_win boolean;
begin
  for v_team in
    select *
    from (
      values
        (p_team_a, p_points_a, p_points_b, p_winner_key = p_team_a),
        (p_team_b, p_points_b, p_points_a, p_winner_key = p_team_b)
    ) as t(team_key, pf, pa, is_win)
  loop
    update public.points_table
    set
      played = played + 1,
      wins = wins + case when v_team.is_win then 1 else 0 end,
      losses = losses + case when v_team.is_win then 0 else 1 end,
      points_for = points_for + v_team.pf,
      points_against = points_against + v_team.pa
    where tournament_id = p_tournament_id
      and category_id = p_category_id
      and team_id = v_team.team_key;
  end loop;

  with ranked as (
    select
      id,
      row_number() over (
        order by wins desc, point_difference desc
      ) as new_rank
    from public.points_table
    where tournament_id = p_tournament_id
      and category_id = p_category_id
  )
  update public.points_table pt
  set ranking = r.new_rank
  from ranked r
  where pt.id = r.id;
end;
$$;

-- ----------------------------------------------------------------------------
-- 5. INTERNAL — apply winner to bracket / points after a fixture result
-- ----------------------------------------------------------------------------

create or replace function public.apply_fixture_competition_result(
  p_fixture_id uuid,
  p_winner_side public.team_side,
  p_points_a integer default 11,
  p_points_b integer default 0
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fixture record;
  v_winner_name text;
begin
  select id, tournament_id, category_id, round, team_a, team_b
  into v_fixture
  from public.fixtures
  where id = p_fixture_id;

  if not found then
    raise exception 'Fixture not found';
  end if;

  v_winner_name := case p_winner_side
    when 'A' then v_fixture.team_a
    else v_fixture.team_b
  end;

  if v_fixture.round = 'RR' and v_fixture.category_id is not null then
    perform public.apply_fixture_points_result(
      v_fixture.tournament_id,
      v_fixture.category_id,
      v_fixture.team_a,
      v_fixture.team_b,
      p_points_a,
      p_points_b,
      v_winner_name
    );
  end if;

  if v_winner_name is not null and v_winner_name <> 'TBD' then
    perform public.propagate_knockout_winner(p_fixture_id, v_winner_name);
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- 6. SCHEDULE A FIXTURE (date/time + court)
-- ----------------------------------------------------------------------------

create or replace function public.schedule_fixture(
  p_fixture_id uuid,
  p_scheduled_at timestamptz,
  p_court text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fixture record;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id, tournament_id, outcome
  into v_fixture
  from public.fixtures
  where id = p_fixture_id;

  if not found then
    raise exception 'Fixture not found';
  end if;

  if not public.user_can_manage_tournament(v_fixture.tournament_id) then
    raise exception 'Not authorized to manage this tournament';
  end if;

  if v_fixture.outcome is not null then
    raise exception 'Cannot schedule a resolved fixture';
  end if;

  update public.fixtures
  set
    scheduled_at = p_scheduled_at,
    court = nullif(trim(coalesce(p_court, '')), '')
  where id = p_fixture_id;

  return jsonb_build_object('scheduled', true);
end;
$$;

-- ----------------------------------------------------------------------------
-- 7. REMOVE A FIXTURE (only before play starts)
-- ----------------------------------------------------------------------------

create or replace function public.remove_tournament_fixture(p_fixture_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fixture record;
  v_match_status public.match_status;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select f.id, f.tournament_id, f.match_id, f.outcome
  into v_fixture
  from public.fixtures f
  where f.id = p_fixture_id;

  if not found then
    raise exception 'Fixture not found';
  end if;

  if not public.user_can_manage_tournament(v_fixture.tournament_id) then
    raise exception 'Not authorized to manage this tournament';
  end if;

  if v_fixture.outcome is not null then
    raise exception 'Cannot remove a resolved fixture';
  end if;

  if v_fixture.match_id is not null then
    select status into v_match_status
    from public.matches
    where id = v_fixture.match_id;

    if v_match_status is distinct from 'draft' then
      raise exception 'Cannot remove fixture after match has started';
    end if;

    delete from public.matches where id = v_fixture.match_id;
  end if;

  delete from public.fixtures where id = p_fixture_id;

  return jsonb_build_object('removed', true);
end;
$$;

-- ----------------------------------------------------------------------------
-- 8. RESOLVE FIXTURE OUTCOME — walkover, no-show, cancel (no live play)
-- ----------------------------------------------------------------------------

create or replace function public.resolve_fixture_outcome(
  p_fixture_id uuid,
  p_outcome text,
  p_winner public.team_side default null,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fixture record;
  v_points_a integer := 0;
  v_points_b integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_outcome not in ('walkover', 'no_show', 'cancelled') then
    raise exception 'Invalid outcome';
  end if;

  select f.id, f.tournament_id, f.category_id, f.round, f.team_a, f.team_b,
         f.match_id, f.outcome
  into v_fixture
  from public.fixtures f
  where f.id = p_fixture_id;

  if not found then
    raise exception 'Fixture not found';
  end if;

  if not public.user_can_manage_tournament(v_fixture.tournament_id) then
    raise exception 'Not authorized to manage this tournament';
  end if;

  if v_fixture.outcome is not null then
    raise exception 'Fixture already resolved';
  end if;

  if p_outcome in ('walkover', 'no_show') then
    if p_winner is null then
      raise exception 'Winner is required for walkover / no-show';
    end if;

    if v_fixture.team_a is null or v_fixture.team_b is null
       or v_fixture.team_a = 'TBD' or v_fixture.team_b = 'TBD'
       or v_fixture.team_b = 'BYE' then
      raise exception 'Both teams must be set';
    end if;

    if v_fixture.match_id is not null then
      if p_winner = 'A' then
        v_points_a := 11;
        v_points_b := 0;
      else
        v_points_a := 0;
        v_points_b := 11;
      end if;

      update public.matches
      set
        status = 'walkover',
        winner = p_winner,
        completed_at = now()
      where id = v_fixture.match_id;
    end if;

    update public.fixtures
    set
      outcome = p_outcome,
      outcome_winner = p_winner,
      outcome_notes = nullif(trim(coalesce(p_notes, '')), '')
    where id = p_fixture_id;

    if p_winner = 'A' then
      v_points_a := 11;
      v_points_b := 0;
    else
      v_points_a := 0;
      v_points_b := 11;
    end if;

    perform public.apply_fixture_competition_result(
      p_fixture_id,
      p_winner,
      v_points_a,
      v_points_b
    );
  else
    -- cancelled — no winner
    if v_fixture.match_id is not null then
      update public.matches
      set status = 'cancelled', completed_at = now()
      where id = v_fixture.match_id
        and status in ('draft', 'live');
    end if;

    update public.fixtures
    set
      outcome = 'cancelled',
      outcome_winner = null,
      outcome_notes = nullif(trim(coalesce(p_notes, '')), '')
    where id = p_fixture_id;
  end if;

  return jsonb_build_object('resolved', true, 'outcome', p_outcome);
end;
$$;

-- ----------------------------------------------------------------------------
-- 9. ABANDON A LIVE TOURNAMENT MATCH
-- ----------------------------------------------------------------------------

create or replace function public.tournament_abandon_match(
  p_match_id uuid,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match record;
  v_fixture_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id, tournament_id, status
  into v_match
  from public.matches
  where id = p_match_id;

  if not found then
    raise exception 'Match not found';
  end if;

  if v_match.tournament_id is null then
    raise exception 'Not a tournament match';
  end if;

  if not public.user_can_manage_tournament(v_match.tournament_id) then
    raise exception 'Not authorized to manage this tournament';
  end if;

  if v_match.status not in ('live', 'pending', 'disputed') then
    raise exception 'Match cannot be abandoned in its current state';
  end if;

  update public.matches
  set status = 'cancelled', completed_at = now()
  where id = p_match_id;

  select id into v_fixture_id
  from public.fixtures
  where match_id = p_match_id;

  if v_fixture_id is not null then
    update public.fixtures
    set
      outcome = 'abandoned',
      outcome_winner = null,
      outcome_notes = nullif(trim(coalesce(p_notes, '')), '')
    where id = v_fixture_id;
  end if;

  return jsonb_build_object('abandoned', true);
end;
$$;

-- ----------------------------------------------------------------------------
-- 10. TOURNAMENT MANAGER — cancel a linked match before/during early play
-- ----------------------------------------------------------------------------

create or replace function public.tournament_cancel_match(p_match_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match record;
  v_fixture_id uuid;
  v_has_events boolean;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id, tournament_id, status, created_by
  into v_match
  from public.matches
  where id = p_match_id;

  if not found then
    raise exception 'Match not found';
  end if;

  if v_match.tournament_id is null then
    raise exception 'Not a tournament match';
  end if;

  if not public.user_can_manage_tournament(v_match.tournament_id) then
    raise exception 'Not authorized to manage this tournament';
  end if;

  if v_match.status not in ('draft', 'live') then
    raise exception 'This match can no longer be cancelled';
  end if;

  select exists (
    select 1 from public.match_events where match_id = p_match_id limit 1
  ) into v_has_events;

  if v_has_events then
    raise exception 'Cannot cancel after scoring has started — use Abandon instead';
  end if;

  update public.matches
  set status = 'cancelled', completed_at = now()
  where id = p_match_id;

  select id into v_fixture_id
  from public.fixtures
  where match_id = p_match_id;

  if v_fixture_id is not null then
    update public.fixtures
    set
      match_id = null,
      outcome = null,
      outcome_winner = null,
      outcome_notes = null
    where id = v_fixture_id;
  end if;

  return jsonb_build_object('cancelled', true);
end;
$$;

-- ----------------------------------------------------------------------------
-- 11. UPDATE TOURNAMENT STATUS (cancel / complete)
-- ----------------------------------------------------------------------------

create or replace function public.update_tournament_status(
  p_tournament_id uuid,
  p_status public.tournament_status
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_status not in ('upcoming', 'live', 'completed', 'cancelled') then
    raise exception 'Invalid tournament status';
  end if;

  if not public.user_can_manage_tournament(p_tournament_id) then
    raise exception 'Not authorized to manage this tournament';
  end if;

  update public.tournaments
  set status = p_status
  where id = p_tournament_id;

  return jsonb_build_object('status', p_status);
end;
$$;

-- ----------------------------------------------------------------------------
-- 12. GRANTS
-- ----------------------------------------------------------------------------

grant execute on function public.schedule_fixture(uuid, timestamptz, text) to authenticated;
grant execute on function public.remove_tournament_fixture(uuid) to authenticated;
grant execute on function public.resolve_fixture_outcome(uuid, text, public.team_side, text) to authenticated;
grant execute on function public.tournament_abandon_match(uuid, text) to authenticated;
grant execute on function public.tournament_cancel_match(uuid) to authenticated;
grant execute on function public.update_tournament_status(uuid, public.tournament_status) to authenticated;
