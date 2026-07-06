-- ============================================================================
-- PickleBuzz — 020_creator_can_score_live.sql
-- Match creators can always score live matches they created.
-- Opponents / delegated scorers still require all invites accepted.
-- Run AFTER 019_restore_legacy_profiles.sql.
-- ============================================================================

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
        or (
          public.match_all_invites_accepted(p_match_id)
          and (
            m.referee_id = auth.uid()
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
        )
      )
  );
$$;
