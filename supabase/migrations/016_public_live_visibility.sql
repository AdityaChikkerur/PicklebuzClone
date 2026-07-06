-- ============================================================================
-- PickleBuzz — 016_public_live_visibility.sql
-- Public matches go live immediately; scoring still requires all invites accepted.
-- Run AFTER 015_unique_profile_phone.sql.
-- ============================================================================

-- Promote existing public drafts so they appear in the live feed.
update public.matches
set
  status = 'live',
  started_at = coalesce(started_at, now())
where status = 'draft'
  and is_public = true;

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
      and public.match_all_invites_accepted(p_match_id)
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
