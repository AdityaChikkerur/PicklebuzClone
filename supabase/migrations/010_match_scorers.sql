-- ============================================================================
-- PickleBuzz — 010_match_scorers.sql
-- Delegated match scorers (invite → accept) + multi-scorer RLS.
-- Run AFTER 009_payment_status_security.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. MATCH SCORERS TABLE
-- ----------------------------------------------------------------------------

create table if not exists public.match_scorers (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'scorer'
    check (role in ('scorer', 'admin')),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'revoked')),
  invited_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (match_id, user_id)
);

create index if not exists idx_match_scorers_match_id
  on public.match_scorers (match_id);

create index if not exists idx_match_scorers_user_id
  on public.match_scorers (user_id, status);

-- ----------------------------------------------------------------------------
-- 2. HELPER: can the current user score / manage a match?
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

create or replace function public.user_is_match_admin(p_match_id uuid)
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
      and (
        m.created_by = auth.uid()
        or public.is_admin()
        or exists (
          select 1
          from public.match_scorers ms
          where ms.match_id = m.id
            and ms.user_id = auth.uid()
            and ms.status = 'accepted'
            and ms.role = 'admin'
        )
      )
  );
$$;

-- Extend read access to delegated scorers
create or replace function public.user_can_read_match(p_match_id uuid)
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
      and (
        m.is_public = true
        or m.created_by = auth.uid()
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
            and ms.status in ('pending', 'accepted')
        )
      )
  );
$$;

-- ----------------------------------------------------------------------------
-- 3. RLS ON match_scorers
-- ----------------------------------------------------------------------------

alter table public.match_scorers enable row level security;

create policy "Match scorers readable by participants"
  on public.match_scorers
  for select
  using (
    user_id = auth.uid()
    or public.user_is_match_admin(match_id)
    or exists (
      select 1
      from public.match_players mp
      where mp.match_id = match_scorers.match_id
        and mp.player_id = auth.uid()
    )
    or public.is_admin()
  );

create policy "Match admins can invite scorers"
  on public.match_scorers
  for insert
  with check (
    public.user_is_match_admin(match_id)
    and invited_by = auth.uid()
  );

create policy "Invitees can respond to scorer invites"
  on public.match_scorers
  for update
  using (
    user_id = auth.uid()
    or public.user_is_match_admin(match_id)
    or public.is_admin()
  )
  with check (
    user_id = auth.uid()
    or public.user_is_match_admin(match_id)
    or public.is_admin()
  );

create policy "Match admins can remove scorers"
  on public.match_scorers
  for delete
  using (
    public.user_is_match_admin(match_id)
    or public.is_admin()
  );

-- ----------------------------------------------------------------------------
-- 4. UPDATE SCORING RLS TO USE user_can_score_match
-- ----------------------------------------------------------------------------

drop policy if exists "Match owners can insert events" on public.match_events;
create policy "Authorized scorers can insert events"
  on public.match_events
  for insert
  with check (public.user_can_score_match(match_id));

drop policy if exists "Match owners can update events" on public.match_events;
create policy "Authorized scorers can update events"
  on public.match_events
  for update
  using (public.user_can_score_match(match_id));

drop policy if exists "Match owners can delete events" on public.match_events;
create policy "Authorized scorers can delete events"
  on public.match_events
  for delete
  using (public.user_can_score_match(match_id));

drop policy if exists "Match owners can update their matches" on public.matches;
create policy "Authorized scorers can update matches"
  on public.matches
  for update
  using (public.user_can_score_match(id))
  with check (public.user_can_score_match(id));

drop policy if exists "Match owners can insert game scores" on public.match_game_scores;
create policy "Authorized scorers can insert game scores"
  on public.match_game_scores
  for insert
  with check (public.user_can_score_match(match_id));

drop policy if exists "Match owners can update game scores" on public.match_game_scores;
create policy "Authorized scorers can update game scores"
  on public.match_game_scores
  for update
  using (public.user_can_score_match(match_id));

drop policy if exists "Match owners can delete game scores" on public.match_game_scores;
create policy "Authorized scorers can delete game scores"
  on public.match_game_scores
  for delete
  using (public.user_can_score_match(match_id));

grant select on public.match_scorers to anon, authenticated;
grant insert, update, delete on public.match_scorers to authenticated;
