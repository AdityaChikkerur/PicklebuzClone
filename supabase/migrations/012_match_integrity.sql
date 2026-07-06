-- ============================================================================
-- PickleBuzz — 012_match_integrity.sql
-- Player invite-before-start, match timing flags, rating eligibility.
-- Run AFTER 011_phone_guest_tournament_admins.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. MATCH PLAYER INVITES
-- ----------------------------------------------------------------------------

alter table public.match_players
  add column if not exists invite_status text not null default 'accepted'
    check (invite_status in ('pending', 'accepted', 'declined'));

alter table public.match_players
  add column if not exists invited_by uuid references public.profiles (id) on delete set null;

alter table public.match_players
  add column if not exists responded_at timestamptz;

create index if not exists idx_match_players_invite_status
  on public.match_players (match_id, invite_status)
  where invite_status = 'pending';

-- ----------------------------------------------------------------------------
-- 2. MATCH TIMING
-- ----------------------------------------------------------------------------

alter table public.matches
  add column if not exists started_at timestamptz;

alter table public.matches
  add column if not exists timing_flag text
    check (timing_flag is null or timing_flag in ('ok', 'short', 'long'));

-- ----------------------------------------------------------------------------
-- 3. HELPERS
-- ----------------------------------------------------------------------------

create or replace function public.match_all_invites_accepted(p_match_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.match_players mp
    where mp.match_id = p_match_id
      and mp.player_id is not null
      and mp.invite_status <> 'accepted'
  );
$$;

create or replace function public.match_is_rating_eligible(p_match_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.matches m
    where m.id = p_match_id
      and m.status in ('verified', 'completed')
      and m.winner is not null
      and public.match_all_invites_accepted(p_match_id)
  );
$$;

create or replace function public.try_activate_match(p_match_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.match_all_invites_accepted(p_match_id) then
    return false;
  end if;

  update public.matches
  set
    status = 'live',
    started_at = coalesce(started_at, now())
  where id = p_match_id
    and status = 'draft';

  return found;
end;
$$;

-- Invitees respond via RPC (bypasses match_players update RLS for non-creators).
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
  v_started boolean := false;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select id, status, created_by, team_a_name, team_b_name
  into v_match
  from public.matches
  where id = p_match_id;

  if not found then
    raise exception 'Match not found';
  end if;

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

-- ----------------------------------------------------------------------------
-- 4. SCORING GATE — only allow scoring when match is live
-- ----------------------------------------------------------------------------

create or replace function public.user_can_score_match(p_match_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.matches m
    where m.id = p_match_id
      and m.status = 'live'
      and (
        m.created_by = auth.uid()
        or m.referee_id = auth.uid()
        or public.is_admin()
        or exists (
          select 1
          from public.match_players mp
          where mp.match_id = m.id
            and mp.player_id = auth.uid()
        )
        or exists (
          select 1
          from public.match_scorers ms
          where ms.match_id = m.id
            and ms.user_id = auth.uid()
            and ms.status = 'accepted'
        )
      )
  );
$$;

-- ----------------------------------------------------------------------------
-- 5. RANKINGS — only count matches where all invites were accepted
-- ----------------------------------------------------------------------------

create or replace view public.player_rankings as
with official_results as (
  select
    mp.player_id,
    m.id as match_id,
    m.completed_at,
    case when m.winner = mp.team then 1 else 0 end as won
  from public.match_players mp
  inner join public.matches m on m.id = mp.match_id
  where m.status in ('verified', 'completed')
    and m.winner is not null
    and mp.player_id is not null
    and public.match_all_invites_accepted(m.id)
),
ranked_results as (
  select
    player_id,
    won,
    row_number() over (
      partition by player_id
      order by completed_at desc nulls last, match_id desc
    ) as recency
  from official_results
),
streaks as (
  select
    player_id,
    coalesce(
      case
        when min(case when won = 0 then recency end) is null
          then count(*) filter (where won = 1)
        when min(case when won = 0 then recency end) = 1
          then 0
        else min(case when won = 0 then recency end) - 1
      end,
      0
    )::integer as current_streak
  from ranked_results
  group by player_id
),
aggregates as (
  select
    player_id,
    count(*)::integer as total_matches,
    count(*) filter (where won = 1)::integer as wins,
    count(*) filter (where won = 0)::integer as losses
  from official_results
  group by player_id
)
select
  p.id,
  p.full_name,
  p.avatar_url,
  p.city,
  p.role,
  p.skill_level,
  p.dupr_rating,
  p.created_at,
  coalesce(a.wins, 0) as wins,
  coalesce(a.total_matches, 0) as total_matches,
  coalesce(a.losses, 0) as losses,
  case
    when coalesce(a.total_matches, 0) = 0 then 0::numeric
    else round((a.wins::numeric / a.total_matches::numeric) * 100, 1)
  end as win_pct,
  coalesce(s.current_streak, 0) as current_streak
from public.profiles p
left join aggregates a on a.player_id = p.id
left join streaks s on s.player_id = p.id;

create or replace view public.player_rankings_strength as
with official as (
  select m.id as match_id, m.winner
  from public.matches m
  where m.status in ('verified', 'completed')
    and m.winner is not null
    and public.match_all_invites_accepted(m.id)
),
participants as (
  select mp.player_id, mp.team, mp.match_id
  from public.match_players mp
  inner join official o on o.match_id = mp.match_id
  where mp.player_id is not null
),
with_opponents as (
  select
    a.player_id,
    a.match_id,
    a.team,
    o.winner,
    avg(p.dupr_rating) as avg_opponent_dupr
  from participants a
  inner join participants b
    on a.match_id = b.match_id and b.player_id <> a.player_id
  inner join public.profiles p on p.id = b.player_id
  inner join official o on o.match_id = a.match_id
  group by a.player_id, a.match_id, a.team, o.winner
),
scored as (
  select
    player_id,
    count(*)::int as rated_matches,
    sum(case when team = winner then avg_opponent_dupr else 0 end) as win_strength,
    sum(case when team <> winner then avg_opponent_dupr * 0.5 else 0 end) as loss_penalty,
    avg(avg_opponent_dupr) as avg_opponent_dupr
  from with_opponents
  group by player_id
)
select
  s.player_id as id,
  coalesce(s.avg_opponent_dupr, 0)::numeric(4, 2) as avg_opponent_dupr,
  coalesce(
    (s.win_strength - s.loss_penalty) / nullif(s.rated_matches, 0),
    0
  )::numeric(4, 2) as strength_rating,
  s.rated_matches
from scored s;

grant select on public.player_rankings to anon, authenticated;
grant select on public.player_rankings_strength to anon, authenticated;

grant execute on function public.match_all_invites_accepted(uuid) to authenticated;
grant execute on function public.match_is_rating_eligible(uuid) to authenticated;
grant execute on function public.try_activate_match(uuid) to authenticated;
grant execute on function public.respond_match_player_invite(uuid, boolean) to authenticated;
