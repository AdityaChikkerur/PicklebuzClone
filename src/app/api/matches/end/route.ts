import { NextResponse } from "next/server";
import type { EndMatchInput } from "@/lib/db/matches";
import { executeEndMatch } from "@/lib/db/endMatchCore";
import { isUuid } from "@/lib/db/config";
import { createAuthenticatedSupabaseClient } from "@/lib/supabaseServer";
import type { Team } from "@/types/match";

function isTeam(value: unknown): value is Team {
  return value === "A" || value === "B";
}

export async function POST(request: Request) {
  const supabase = await createAuthenticatedSupabaseClient(request);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Your session expired. Please sign in again." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid match payload." }, { status: 400 });
  }

  const payload = body as Partial<EndMatchInput>;
  const matchId = typeof payload.matchId === "string" ? payload.matchId : "";
  const matchWinner =
    payload.matchWinner === null || isTeam(payload.matchWinner)
      ? payload.matchWinner
      : null;

  if (!isUuid(matchId)) {
    return NextResponse.json({ error: "Invalid match id." }, { status: 400 });
  }

  if (!Array.isArray(payload.gameScores)) {
    return NextResponse.json({ error: "Game scores are required." }, { status: 400 });
  }

  const gameScores = payload.gameScores.map((game, index) => {
    const row = game as unknown as Record<string, unknown>;
    return {
      gameNumber: Number(row.gameNumber ?? index + 1),
      scoreA: Number(row.scoreA ?? 0),
      scoreB: Number(row.scoreB ?? 0),
      winner: isTeam(row.winner) ? row.winner : null,
    };
  });

  const result = await executeEndMatch(supabase, user.id, {
    matchId,
    gameScores,
    matchWinner,
  });

  if (result.error || !result.data) {
    return NextResponse.json(
      { error: result.error ?? "Could not save match." },
      { status: 500 }
    );
  }

  return NextResponse.json(result.data);
}
