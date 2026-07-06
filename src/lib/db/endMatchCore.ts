import type { SupabaseClient } from "@supabase/supabase-js";
import { formatDbError } from "@/lib/db/formatDbError";
import type { EndMatchInput } from "@/lib/db/matches";
import type { DbResult } from "@/lib/db/matches";

const ok = <T>(data: T): DbResult<T> => ({ data, error: null });
const fail = (error: unknown): DbResult<never> => ({
  data: null,
  error: formatDbError(error, "Could not save match"),
});

/**
 * Persist final scores, mark the match verified, and refresh player ratings.
 * Runs on the server with an authenticated Supabase client (cookie or Bearer).
 */
export async function executeEndMatch(
  supabase: SupabaseClient,
  userId: string,
  input: EndMatchInput
): Promise<DbResult<{ status: string; verified: boolean }>> {
  try {
    const { data: match, error: readErr } = await supabase
      .from("matches")
      .select("id, status, created_by")
      .eq("id", input.matchId)
      .single();

    if (readErr) throw readErr;
    if (!match) return fail("Match not found");

    if (match.created_by !== userId) {
      const { data: canScore, error: rpcErr } = await supabase.rpc(
        "user_can_score_match",
        { p_match_id: input.matchId }
      );

      let allowed = !rpcErr && Boolean(canScore);

      if (!allowed) {
        const { data: participant } = await supabase
          .from("match_players")
          .select("player_id")
          .eq("match_id", input.matchId)
          .eq("player_id", userId)
          .maybeSingle();
        allowed = Boolean(participant);
      }

      if (!allowed) {
        return fail("You do not have permission to save this match.");
      }
    }

    if (["verified", "completed"].includes(match.status as string)) {
      return ok({ status: match.status as string, verified: true });
    }

    if (input.gameScores.length > 0) {
      const gameRows = input.gameScores.map((g) => ({
        match_id: input.matchId,
        game_number: g.gameNumber,
        score_a: g.scoreA,
        score_b: g.scoreB,
        winner: g.winner,
      }));

      const { error: gameErr } = await supabase
        .from("match_game_scores")
        .upsert(gameRows, { onConflict: "match_id,game_number" });

      if (gameErr) throw gameErr;
    }

    const completedAt = new Date().toISOString();
    const { error: updateErr } = await supabase
      .from("matches")
      .update({
        status: "verified",
        winner: input.matchWinner,
        completed_at: completedAt,
      })
      .eq("id", input.matchId);

    if (updateErr) throw updateErr;

    if (match.created_by === userId) {
      const { data: creatorRow } = await supabase
        .from("match_players")
        .select("player_id")
        .eq("match_id", input.matchId)
        .eq("player_id", userId)
        .maybeSingle();

      if (!creatorRow) {
        await supabase.from("match_players").insert({
          match_id: input.matchId,
          player_id: userId,
          team: "A",
          server_number: 1,
        });
      }
    }

    try {
      const { data: matchMeta } = await supabase
        .from("matches")
        .select("team_a_name, team_b_name, winner")
        .eq("id", input.matchId)
        .maybeSingle();

      const { data: players } = await supabase
        .from("match_players")
        .select("player_id")
        .eq("match_id", input.matchId);

      const participantIds = [
        ...new Set(
          (players ?? [])
            .map((row) => row.player_id as string)
            .filter(Boolean)
        ),
      ];

      if (participantIds.length > 0) {
        const { createNotificationsWithClient } = await import(
          "@/lib/db/notifications"
        );

        const winnerLabel =
          matchMeta?.winner === "A"
            ? matchMeta.team_a_name
            : matchMeta?.winner === "B"
              ? matchMeta.team_b_name
              : "Tie";

        const summary = matchMeta
          ? `${matchMeta.team_a_name} vs ${matchMeta.team_b_name}`
          : "Your match";

        await createNotificationsWithClient(
          supabase,
          participantIds.map((participantId) => ({
            userId: participantId,
            icon: "result_confirmation",
            text: `Match complete: ${summary}. Winner: ${winnerLabel}`,
            link: `/match/${input.matchId}`,
          }))
        );
      }
    } catch {
      // Notifications must not block match save.
    }

    const { updateRatingsForMatch } = await import("@/lib/db/profiles");
    await updateRatingsForMatch(input.matchId, supabase);

    try {
      const { syncFixtureFromMatch } = await import("@/lib/db/fixtures");
      await syncFixtureFromMatch(input.matchId, supabase);
    } catch {
      // Tournament fixture sync is best-effort.
    }

    return ok({ status: "verified", verified: true });
  } catch (error) {
    return fail(error);
  }
}
