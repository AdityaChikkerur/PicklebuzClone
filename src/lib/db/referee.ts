import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { createClient } from "@/lib/supabase";
import type { MatchStatus } from "@/types/match";

export interface RefereeMatch {
  id: string;
  teamAName: string;
  teamBName: string;
  status: MatchStatus;
  hasReferee: boolean;
  scoreFlagged: boolean;
  createdAt: string;
}

function mapRefereeMatch(row: {
  id: string;
  team_a_name: string;
  team_b_name: string;
  status: MatchStatus;
  has_referee: boolean;
  score_flagged: boolean;
  created_at: string;
}): RefereeMatch {
  return {
    id: row.id,
    teamAName: row.team_a_name,
    teamBName: row.team_b_name,
    status: row.status,
    hasReferee: row.has_referee,
    scoreFlagged: row.score_flagged,
    createdAt: row.created_at,
  };
}

export async function fetchRefereeMatches(
  refereeId: string
): Promise<RefereeMatch[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, team_a_name, team_b_name, status, has_referee, score_flagged, created_at"
    )
    .eq("referee_id", refereeId)
    .in("status", ["live", "pending", "draft"])
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapRefereeMatch);
}

export async function assignRefereeToMatch(
  matchId: string,
  refereeId: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = createClient();
  const { error } = await supabase
    .from("matches")
    .update({ referee_id: refereeId, has_referee: true })
    .eq("id", matchId);

  return !error;
}

export async function isRefereeForMatch(
  matchId: string,
  userId: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = createClient();
  const { data } = await supabase
    .from("matches")
    .select("referee_id, has_referee")
    .eq("id", matchId)
    .maybeSingle();

  if (!data?.has_referee) return true;
  if (!data.referee_id) return true;
  return data.referee_id === userId;
}
