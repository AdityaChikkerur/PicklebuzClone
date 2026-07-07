import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { isUuid } from "@/lib/db/config";
import type { FixtureOutcome, TournamentStatus } from "@/types/tournament";

export type DbResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

const ok = <T>(data: T): DbResult<T> => ({ data, error: null });
const fail = (error: unknown): DbResult<never> => ({
  data: null,
  error: error instanceof Error ? error.message : String(error),
});

/** Schedule a fixture with date/time and optional court. */
export async function scheduleFixture(input: {
  fixtureId: string;
  scheduledAt: string;
  court?: string;
}): Promise<DbResult<{ scheduled: boolean }>> {
  if (!isSupabaseConfigured() || !isUuid(input.fixtureId)) {
    return fail("Scheduling requires a live database connection");
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("schedule_fixture", {
      p_fixture_id: input.fixtureId,
      p_scheduled_at: input.scheduledAt,
      p_court: input.court ?? null,
    });
    if (error) throw error;
    const payload = data as { scheduled?: boolean } | null;
    return ok({ scheduled: Boolean(payload?.scheduled) });
  } catch (e) {
    return fail(e);
  }
}

/** Remove a fixture that has not started play. */
export async function removeTournamentFixture(
  fixtureId: string
): Promise<DbResult<{ removed: boolean }>> {
  if (!isSupabaseConfigured() || !isUuid(fixtureId)) {
    return fail("Fixture removal requires a live database connection");
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("remove_tournament_fixture", {
      p_fixture_id: fixtureId,
    });
    if (error) throw error;
    const payload = data as { removed?: boolean } | null;
    return ok({ removed: Boolean(payload?.removed) });
  } catch (e) {
    return fail(e);
  }
}

/** Resolve a fixture without full play: walkover, no-show, or cancel. */
export async function resolveFixtureOutcome(input: {
  fixtureId: string;
  outcome: FixtureOutcome | "cancelled";
  winner?: "A" | "B";
  notes?: string;
}): Promise<DbResult<{ resolved: boolean; outcome: string }>> {
  if (!isSupabaseConfigured() || !isUuid(input.fixtureId)) {
    return fail("Fixture resolution requires a live database connection");
  }

  if (
    (input.outcome === "walkover" || input.outcome === "no_show") &&
    !input.winner
  ) {
    return fail("Select which team wins for walkover / no-show");
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("resolve_fixture_outcome", {
      p_fixture_id: input.fixtureId,
      p_outcome: input.outcome,
      p_winner: input.winner ?? null,
      p_notes: input.notes ?? null,
    });
    if (error) throw error;
    const payload = data as { resolved?: boolean; outcome?: string } | null;
    return ok({
      resolved: Boolean(payload?.resolved),
      outcome: payload?.outcome ?? input.outcome,
    });
  } catch (e) {
    return fail(e);
  }
}

/** Abandon a live tournament match mid-play. */
export async function abandonTournamentMatch(
  matchId: string,
  notes?: string
): Promise<DbResult<{ abandoned: boolean }>> {
  if (!isSupabaseConfigured() || !isUuid(matchId)) {
    return fail("Abandon requires a live database connection");
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("tournament_abandon_match", {
      p_match_id: matchId,
      p_notes: notes ?? null,
    });
    if (error) throw error;
    const payload = data as { abandoned?: boolean } | null;
    return ok({ abandoned: Boolean(payload?.abandoned) });
  } catch (e) {
    return fail(e);
  }
}

/** Tournament manager cancels a linked match before scoring starts. */
export async function tournamentCancelMatch(
  matchId: string
): Promise<DbResult<{ cancelled: boolean }>> {
  if (!isSupabaseConfigured() || !isUuid(matchId)) {
    return fail("Match cancellation requires a live database connection");
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("tournament_cancel_match", {
      p_match_id: matchId,
    });
    if (error) throw error;
    const payload = data as { cancelled?: boolean } | null;
    return ok({ cancelled: Boolean(payload?.cancelled) });
  } catch (e) {
    return fail(e);
  }
}

/** Update tournament lifecycle status (cancel, complete, etc.). */
export async function updateTournamentStatus(
  tournamentId: string,
  status: TournamentStatus
): Promise<DbResult<{ status: TournamentStatus }>> {
  if (!isSupabaseConfigured() || !isUuid(tournamentId)) {
    return fail("Status update requires a live database connection");
  }

  if (status === "draft") {
    return fail("Cannot set tournament back to draft");
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("update_tournament_status", {
      p_tournament_id: tournamentId,
      p_status: status,
    });
    if (error) throw error;
    const payload = data as { status?: TournamentStatus } | null;
    return ok({ status: payload?.status ?? status });
  } catch (e) {
    return fail(e);
  }
}
