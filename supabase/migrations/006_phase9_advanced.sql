-- ============================================================================
-- PickleBuzz — 006_phase9_advanced.sql (Phase 9)
-- DUPR sync fields, follows, referee assignment, score flags, strength view.
-- Run AFTER 005_phase8_payments.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. DUPR sync on profiles
-- ----------------------------------------------------------------------------

alter table public.profiles
  add column if not exists dupr_id text,
  add column if not exists dupr_synced_at timestamptz;

create unique index if not exists idx_profiles_dupr_id
  on public.profiles (dupr_id)
  where dupr_id is not null;

-- ----------------------------------------------------------------------------
-- 2. Referee assignment + admin score flags on matches
-- ----------------------------------------------------------------------------

alter table public.matches
  add column if not exists referee_id uuid references public.profiles(id) on delete set null,
  add column if not exists score_flagged boolean not null default false;

create index if not exists idx_matches_referee
  on public.matches (referee_id)
  where referee_id is not null;

create index if not exists idx_matches_score_flagged
  on public.matches (score_flagged)
  where score_flagged = true;

-- ----------------------------------------------------------------------------
-- 3. Player follow graph
-- ----------------------------------------------------------------------------

create table if not exists public.player_follows (
  follower_id  uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists idx_player_follows_following
  on public.player_follows (following_id);

alter table public.player_follows enable row level security;

drop policy if exists "follows read own" on public.player_follows;
create policy "follows read own" on public.player_follows
  for select using (follower_id = auth.uid() or following_id = auth.uid());

drop policy if exists "follows insert own" on public.player_follows;
create policy "follows insert own" on public.player_follows
  for insert with check (follower_id = auth.uid());

drop policy if exists "follows delete own" on public.player_follows;
create policy "follows delete own" on public.player_follows
  for delete using (follower_id = auth.uid());

grant select, insert, delete on public.player_follows to authenticated;

-- ----------------------------------------------------------------------------
-- 4. Opponent-strength rankings view
-- Weight wins against stronger opponents higher than wins vs weaker ones.
-- ----------------------------------------------------------------------------

create or replace view public.player_rankings_strength as
with official as (
  select m.id as match_id, m.winner
  from public.matches m
  where m.status in ('verified', 'completed')
    and m.winner is not null
),
participants as (
  select mp.player_id, mp.team, mp.match_id
  from public.match_players mp
  inner join official o on o.match_id = mp.match_id
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

grant select on public.player_rankings_strength to anon, authenticated;
