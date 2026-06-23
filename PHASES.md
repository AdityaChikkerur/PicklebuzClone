# PickleBuzz — Phased delivery plan

Work through these phases in order. Each phase should be deployable before moving on.

## Phase 1 — Foundation (current)

**Goal:** Real backend is trustworthy; repo is deployable; demo mode is explicit.

- [x] `dataSource` helper — stop silent mock fallback when Supabase is configured
- [x] `fetchClubsByOwnerId` — club dashboard reads owned clubs from DB
- [x] GitHub Actions CI (`lint` + `build`)
- [x] Git initialized locally (`Picklebuzz/.git`)
- [ ] Push to GitHub + deploy to Vercel (see README)
- [ ] Fill `.env.local` with real Supabase URL + anon key

**Done when:** App builds in CI, env is configured, empty DB shows empty states (not fake data).

---

## Phase 2 — Live scoring + realtime (validate)

**Goal:** Prove the core product loop on production Supabase.

- [x] E2E test: match setup → live score → end match → verify
- [x] Spectator realtime on `/spectate/[id]`
- [x] Persist `hasReferee` from match setup wizard
- [x] Fix signup falling back to demo session on Supabase errors

**Done when:** Two browsers see the same live score; match history appears in DB.

---

## Phase 3 — Rankings + dashboard (real data)

**Goal:** Player home feels real after playing matches.

- [x] Wire `/rankings` → `player_rankings` SQL view
- [x] Wire dashboard KPIs + recent matches → verified/completed matches
- [x] Wire `/stats` basic charts from match history (keep premium as upsell)

**Done when:** Playing and verifying a match updates rankings and dashboard.

---

## Phase 4 — Tournaments (CRUD + registration)

**Goal:** Create and join tournaments for real.

- [x] Add `lib/db/tournaments.ts`
- [x] Wire `TournamentWizard` → `tournaments` + `tournament_categories` insert
- [x] Wire `/tournament/[id]/register` → `tournament_registrations`
- [x] Tournament detail reads from DB (overview, participants)
- [x] Keep fixtures/bracket as mock until Phase 5

**Done when:** Organizer creates tournament; player registers; both see it after reload.

---

## Phase 5 — Notifications + bookings hardening

**Goal:** Operational flows notify users; clubs work without localStorage.

- [x] Notification writers: match end, booking confirm, registration approved
- [x] Club court add/edit wizard on `/club-dashboard`
- [x] Booking confirm/cancel persists for club owners
- [x] Seed script or SQL for demo clubs when DB is empty (optional)

**Done when:** Actions create inbox rows; bookings are DB-only when configured.

---

## Phase 6 — Organizer + admin on real DB

**Goal:** Staff dashboards manage real records.

- [x] Organizer dashboard → tournaments + pending registrations from DB
- [x] Admin disputes → `disputes` table (resolve uphold/reject)
- [x] Admin users → profiles (ban, verify, boost flags)
- [x] Admin tournaments → feature/archive in DB

**Done when:** Admin resolves a player dispute; change persists.

---

## Phase 7 — Fixtures, brackets, advancement

**Goal:** Tournament competition runs end-to-end.

- [x] Fixture generation (round-robin first)
- [x] Bracket view from `fixtures` table
- [x] Winner propagation + points table updates
- [x] Link fixture matches to live scoring

**Done when:** Organizer generates fixtures; players score linked matches.

---

## Phase 8 — Payments + OAuth

**Goal:** Monetization and easier sign-in.

- [x] Razorpay checkout + webhooks
- [x] Replace `payments_placeholder` for tournament fees
- [x] Google SSO via Supabase OAuth

---

## Phase 9 — Advanced / product bets

- [x] DUPR API sync
- [x] Advanced rankings (opponent strength, edge functions)
- [x] Referee assigned-match workflow + route gating
- [x] Admin fake-score flags
- [x] Follow system on discover
- [x] PWA / push notifications
- [x] Test suite (Vitest + Playwright)
- [ ] Video / live stream (if scoped)

---

## How to use this doc

1. Complete Phase 1 checklist before starting Phase 2.
2. Mark items `[x]` in this file as each lands.
3. One phase per PR where possible for reviewable diffs.
