# PickleBuzz

Mobile-first pickleball app for match scoring, tournaments, and player rankings.

**Score. Compete. Improve.**

## Features (Phase 1)

| Route | Description |
|-------|-------------|
| `/` | Public landing — hero, live matches, featured tournaments |
| `/rules` | Basic pickleball rules (accordion + diagrams) |
| `/auth` | Login & signup (email/password, Google SSO) |
| `/dashboard` | Player dashboard — KPIs, form strip, charts, recent matches |
| `/match-setup` | 4-step match creation wizard |
| `/live-scoring` | Fullscreen live scorer with rally scoring, faults, timeouts |
| `/create-tournament` | 4-step tournament wizard with categories & rules |
| `/rankings` | Leaderboard with podium, filters, and category tabs |
| `/profile` | Player profile with profile-boost placeholder |
| `/stats` | Player analytics with premium upsell |

The UI works with **inline mock data** when Supabase is not configured, so you can explore every screen without a backend.

## Tech stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS 3.4** with CSS variables + dark mode
- **Supabase** — auth, PostgreSQL, RLS (`@supabase/ssr`, `@supabase/supabase-js`)
- **Zustand** — global state (`authStore`, `matchStore`)
- **React Hook Form + Zod** — form validation
- **Recharts** — performance charts
- **Sonner** — toast notifications
- **@heroicons/react** — icons
- **Plus Jakarta Sans** — Google Font

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [npm](https://www.npmjs.com/) (or pnpm / yarn)
- A [Supabase](https://supabase.com/) project (optional for local UI exploration)

## Quick start

### 1. Install dependencies

```bash
cd Picklebuzz
npm install
```

### 2. Environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_NAME=PickleBuzz
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Tip:** Supabase env vars are required for sign-in and sign-up. Without them, auth screens show an unavailable message while other routes can still use inline mock data.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Production build

```bash
npm run build
npm start
```

## Supabase setup

### Create a project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.
2. Under **Project Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Run the database migration

Apply both schema files in order:

1. `supabase/migrations/001_initial_schema.sql` — core tables, `player_rankings` view, RLS
2. `supabase/migrations/002_extended_schema.sql` — clubs, bookings, notifications, disputes, fixtures, realtime publication

**Option A — SQL Editor (quickest)**

1. Open your project → **SQL Editor** → **New query**
2. Paste and run `001_initial_schema.sql`, then `002_extended_schema.sql`

**Option B — Supabase CLI**

```bash
# Install CLI: https://supabase.com/docs/guides/cli
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

The migrations create:

- **001:** `profiles`, `matches`, `match_players`, `match_events`, `match_game_scores`, `tournaments`, `tournament_categories`, `tournament_registrations`, `player_rankings` view
- **002:** `disputes`, `fixtures`, `points_table`, `clubs`, `courts`, `court_bookings`, `rankings`, `notifications`, `payments_placeholder`, profile/tournament extensions, realtime publication

### Auth configuration

In the Supabase dashboard under **Authentication → Providers**:

1. Enable **Email** provider (enabled by default).
2. For local dev, you may want to disable **Confirm email** under **Authentication → Providers → Email** so signups work immediately.
3. Enable **Google** provider — add OAuth client ID/secret from [Google Cloud Console](https://console.cloud.google.com/). Set redirect URL to `https://<project-ref>.supabase.co/auth/v1/callback` in Google, and add `http://localhost:3000/auth/callback` (and your production URL) under **Authentication → URL Configuration → Redirect URLs** in Supabase.

### Verify the setup

1. Sign up at `/auth` with a real email/password.
2. Check **Table Editor → profiles** — a row should appear for the new user.
3. Log in again — the dashboard should load the profile from Supabase.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E (demo mode) |

## CI / deployment

### GitHub Actions

Pushes and PRs to `main`/`master` run lint and production build (see `.github/workflows/ci.yml`).

### Deploy to Vercel

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com/) (root directory: `Picklebuzz` if the repo contains the parent folder).
3. Set environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL`, plus optional Razorpay and `SUPABASE_SERVICE_ROLE_KEY` for payments.
4. Deploy — `npm run build` must pass (same as CI).

### Phased delivery

See [PHASES.md](./PHASES.md) for the full build-out plan (foundation → scoring → rankings → tournaments → …).

## Project structure

```
Picklebuzz/
├── src/
│   ├── app/                  # Next.js App Router pages
│   ├── components/
│   │   ├── auth/             # Login, signup, demo panel
│   │   ├── dashboard/        # KPIs, charts, recent matches
│   │   ├── layout/           # AppLayout, Sidebar, BottomNav
│   │   ├── match/            # Match setup wizard
│   │   ├── rankings/         # Leaderboard
│   │   ├── scoring/          # Live scoring
│   │   ├── tournament/       # Tournament wizard
│   │   └── ui/               # Shared UI primitives
│   ├── lib/                  # Supabase clients, utils
│   ├── store/                # Zustand stores
│   ├── styles/               # globals.css (CSS variables + components)
│   └── types/                # TypeScript types
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_extended_schema.sql
│       ├── 003_phase2_has_referee.sql
│       ├── 004_phase6_admin_flags.sql
│       ├── 005_phase8_payments.sql
│       └── 006_phase9_advanced.sql
├── .github/workflows/ci.yml
├── PHASES.md
├── .env.local.example
└── package.json
```

## Database overview

| Table | Purpose |
|-------|---------|
| `profiles` | User profile (linked to `auth.users`) |
| `matches` | Match metadata, scoring config, status |
| `match_players` | Players assigned to teams |
| `match_events` | Point/fault/timeout timeline |
| `match_game_scores` | Per-game final scores |
| `tournaments` | Tournament details & rules |
| `tournament_categories` | Singles/doubles/mixed categories |
| `tournament_registrations` | Player sign-ups per category |

Row Level Security (RLS) is enabled on all tables:

- **Public** matches and tournaments are readable by anyone.
- **Owners** can create, update, and delete their own records.
- **Participants** can read matches they are part of.

## Development notes

- **Mobile-first:** layouts are designed for 375px width and up.
- **Dark mode:** toggle via `.dark` class on `<html>`; all colors use CSS variables.
- **Mock data:** demo mode still uses inline mock data when Supabase env is missing; rankings/dashboard/stats read from DB when configured.
- **Client components:** `use client` only where interactivity is required; pages default to Server Components.

## Phase 2 — Live scoring + realtime (complete)

Apply migrations in order after `001_initial_schema.sql`:

```bash
# SQL Editor: paste supabase/migrations/002_extended_schema.sql
# Then: supabase/migrations/003_phase2_has_referee.sql
# Or: supabase db push
```

### Phase 2 validation checklist

- Run migration `003_phase2_has_referee.sql` on your Supabase project
- `npm run test:e2e` — demo-mode flow (match setup → score → end)
- With real Supabase env: open `/live-scoring` in one browser and `/spectate/[uuid]` in another; scores should sync
- Optional: `E2E_SUPABASE_URL=1 npm run test:e2e` for two-browser realtime test

## Phase 3 — Rankings + dashboard (complete)

When Supabase is configured, player stats come from verified/completed matches:

| Route | Data source |
|-------|-------------|
| `/rankings` | `player_rankings` SQL view + match-type aggregates |
| `/dashboard` | KPIs, form strip, recent matches, city rankings, performance charts |
| `/stats` | Same stats bundle as dashboard (premium insights remain locked) |

### Phase 3 validation checklist

- Ensure `001_initial_schema.sql` is applied (`player_rankings` view ships in this migration)
- Play a match → end → opponent confirms on `/match/[id]`
- Reload `/dashboard` — KPIs and recent matches should reflect the verified result
- Reload `/rankings` — both players appear with updated win % and streak

## Phase 4 — Tournaments CRUD + registration (complete)

When Supabase is configured, tournaments are persisted end-to-end:

| Route | Data source |
|-------|-------------|
| `/create-tournament` | Inserts `tournaments` + `tournament_categories` |
| `/tournament/[id]` | Overview + participants from DB; fixtures/bracket/points stay mock until Phase 5 |
| `/tournament/[id]/register` | Inserts `tournament_registrations` (with optional partner) |
| `/organizer` | Lists organizer's tournaments + pending registrations from DB |

### Phase 4 validation checklist

- Sign in as organizer (real Supabase account, not demo)
- Create a tournament at `/create-tournament` → publish → open the success link
- Sign in as a player → register at `/tournament/[uuid]/register`
- Reload tournament detail — participant count and Participants tab should update
- Organizer approves/rejects from Participants tab or `/organizer`

## Phase 6 — Organizer + admin on real DB (complete)

When Supabase is configured, staff dashboards read and write real records:

| Route | Data source |
|-------|-------------|
| `/organizer` | Organizer tournaments, pending registrations, KPIs from DB |
| `/admin` | Platform KPIs (users, tournaments, clubs, open disputes) |
| `/admin/users` | `profiles` — ban, verify, boost flags persist |
| `/admin/disputes` | `disputes` — uphold creator/opponent or mark resolved |
| `/admin/tournaments` | `tournaments.featured` / `tournaments.archived` |
| `/` featured grid | Featured non-archived public tournaments from DB |

Apply `004_phase6_admin_flags.sql` before testing (adds profile/tournament flags + admin RLS).

### Phase 6 validation checklist

- Apply `004_phase6_admin_flags.sql` via Supabase SQL editor or `supabase db push`
- Set your account role to `admin` in the `profiles` table
- Play a match → opponent disputes on `/match/[id]` → resolve at `/admin/disputes`
- Reload dispute list — status should stay `resolved`
- Ban/verify/boost a user at `/admin/users` → reload — flags persist
- Feature a tournament at `/admin/tournaments` → reload `/` — it appears in featured grid

## Phase 7 — Fixtures, brackets, advancement (complete)

When Supabase is configured, tournament competition runs from the `fixtures` and `points_table` tables:

| Route / action | Data source |
|----------------|-------------|
| Fixtures tab → Generate | Round-robin or knockout fixtures from approved registrations |
| Fixtures tab → Start | Creates `matches` row linked via `fixtures.match_id` → live scoring |
| Points tab | `points_table` — updates when linked match is verified |
| Bracket tab | Knockout `fixtures` rows (QF / SF / Final) with winner propagation |
| Match verify | `syncFixtureFromMatch` updates standings and advances bracket slots |

### Phase 7 validation checklist

- Create a round-robin tournament with ≥2 approved registrations
- Open Fixtures or Points tab → Generate → fixtures appear
- Start a fixture → score in `/live-scoring` → end → opponent confirms
- Reload Points tab — wins/losses and ranking updated
- For knockout: generate bracket, complete a QF match → SF slot fills with winner

## Phase 8 — Payments + OAuth (complete)

Apply migration `005_phase8_payments.sql` after prior migrations. It renames `payments_placeholder` → `payments` and adds Razorpay gateway columns.

### Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay key id (public — used in checkout) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret (server only — create orders) |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature verification |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role for webhook payment updates |

Leave Razorpay vars as placeholders to keep tournament registration in demo “pay later” mode.

### Razorpay webhook

In the Razorpay dashboard, add a webhook pointing to:

`https://your-domain.com/api/payments/razorpay/webhook`

Subscribe to `payment.captured` and `order.paid`.

### Phase 8 validation checklist

- Enable Google OAuth in Supabase → `/auth` → **Continue with Google** → lands on dashboard with profile
- Configure Razorpay test keys → register for a paid tournament → Razorpay modal opens → test payment → row in `payments` with `status = paid`
- Without Razorpay keys → registration still works with “Pay later & submit” (pending row in `payments`)

## Phase 9 — Advanced features (complete)

Apply migration `006_phase9_advanced.sql` after prior migrations.

| Feature | Route / action |
|---------|----------------|
| DUPR sync | `/profile` → link DUPR ID → sync rating |
| Strength rankings | `/rankings` → **Strength** tab (opponent-weighted SQL view) |
| Referee dashboard | `/referee` (referee + admin roles) |
| Fake-score flags | `/admin/disputes` → Flag score · `/admin/flagged` queue |
| Follow players | `/discover` → Follow · filter **Following** |
| PWA | Install from browser (manifest + service worker in production) |
| Unit tests | `npm run test` (Vitest) · `npm run test:e2e` (Playwright) |

### Phase 9 validation checklist

- Run `006_phase9_advanced.sql` on Supabase
- `/profile` → enter DUPR ID → sync (demo mode without `DUPR_API_KEY`)
- `/rankings` → Strength tab shows opponent-weighted order when matches exist
- Sign in as `referee@picklebuzz.demo` → `/referee` dashboard
- Admin flags a disputed match → appears at `/admin/flagged`
- `/discover` → follow a player → **Following** filter shows them
- `npm run test` and `npm run test:e2e` pass in CI

### Completed (steps 17–27)

| Step | Deliverable |
|------|-------------|
| 17 | `002_extended_schema.sql` — disputes, fixtures, points_table, clubs, courts, bookings, rankings, notifications, payments; profile/tournament extensions; realtime publication |
| 18 | `src/lib/aiReport.ts`, `src/hooks/useRealtimeMatch.ts`, `src/lib/mock/extendedMockData.ts` |
| 19 | Rally + side-out scoring, serve rotation, faults, timeouts — in `src/store/matchStore.ts` |
| 20 | `/match/[id]` (summary, verification, AI report) and `/spectate/[id]` (read-only live board) |
| 21 | `/tournament/[id]` (detail tabs: overview, fixtures, bracket, points, participants, live, results) + `BracketView`, `PointsTableView`, `FixturesList`, `ParticipantsManager` + `/tournament/[id]/register` |
| 22 | `/clubs`, `/club/[id]`, `/club/[id]/book` (court booking wizard), `/club-dashboard` (owner KPIs + booking management) + `useClubOwnerBookings`, `useCourtAvailability`, mock booking storage |
| 23 | `/discover` (player search with city/skill/intent filters), `/notifications` (inbox, mark read, realtime) + `useDiscoverPlayers`, `useNotifications`, `lib/db/players.ts`, `lib/db/notifications.ts`, `NotificationBell` |
| 24 | `/organizer` (KPIs, tournament list, approval inbox), `/admin` + `/admin/users`, `/admin/disputes`, `/admin/tournaments` + `useOrganizerDashboard`, `useAdminDashboard`, `lib/mock/adminMockData.ts`, role-filtered nav |
| 25 | `/` public landing (hero, live-now strip, featured tournaments, explore links, auth redirect) + `/rules` (accordion rules reference with SVG diagrams) + `lib/mock/landingMockData.ts`, `useLandingPage` |
| 26 | `src/middleware.ts` + `src/lib/auth/routeGuards.ts` — server-side auth redirect, role gates (`/organizer`, `/club-dashboard`, `/admin/*`), demo-session cookies for mock mode |
| 27 | Monetization placeholders — `SponsorBannerSlot`, `PremiumUpsellCard`, `PaymentPlaceholderPanel`, `ProfileBoostCard`, `FeaturedListingUpsell`, `CommissionSummary` + `lib/db/payments.ts`, `hooks/usePayments`, `/profile`, `/stats` |

**Try these routes:**

- `/match/m1` — verified match with AI report
- `/match/m-pending` — pending confirmation flow
- `/match/m-disputed` — disputed result banner
- `/match/m-live` — live match → link to spectate
- `/spectate/m-live` — spectator scoreboard
- `/tournament/t-rr-1` — round-robin league with points table & live fixture
- `/tournament/t-ko-1` — knockout bracket (organizer manage view)
- `/tournament/t-ko-1/register` — registration flow with partner search
- `/clubs` — discover clubs with city filter & search
- `/club/club-1` — Smash Arena detail + courts
- `/club/club-1/book` — book a court (court → date/time → confirm)
- `/club-dashboard` — club owner dashboard (use `club@picklebuzz.demo`)
- `/discover` — find partners and open-match players
- `/notifications` — inbox with unread badge in header
- `/organizer` — organizer dashboard (use `organizer@picklebuzz.demo`)
- `/admin` — admin hub (use `admin@picklebuzz.demo`)
- `/admin/users` — user management (ban / verify / boost)
- `/admin/disputes` — dispute queue with uphold / resolve actions
- `/admin/tournaments` — feature / archive tournaments
- `/` — public landing (live matches, featured tournaments, explore)
- `/rules` — basic pickleball rules with diagrams
- `/profile` — profile boost placeholder (use any demo account)
- `/stats` — player analytics + premium upsell card

## License

Private — all rights reserved.
