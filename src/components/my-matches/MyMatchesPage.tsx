"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout";
import { createClient } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

type MatchRow = {
  id: string;
  team_a_name: string;
  team_b_name: string;
  match_type: string;
  status: string;
  winner: string | null;
  venue: string | null;
  city: string | null;
  created_at: string;
  completed_at: string | null;
};

export function MyMatchesPage() {
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function loadMatches() {
      setLoading(true);
      const supabase = createClient();

      const { data: matchPlayers, error: mpError } = await supabase
        .from("match_players")
        .select("match_id")
        .eq("player_id", userId);

      if (mpError || !matchPlayers?.length) {
        setMatches([]);
        setLoading(false);
        return;
      }

      const matchIds = matchPlayers.map((row) => row.match_id as string);

      const { data, error } = await supabase
        .from("matches")
        .select(
          "id, team_a_name, team_b_name, match_type, status, winner, venue, city, created_at, completed_at"
        )
        .in("id", matchIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading my matches:", error);
        setMatches([]);
      } else {
        setMatches((data ?? []) as MatchRow[]);
      }

      setLoading(false);
    }

    void loadMatches();
  }, [userId]);

  return (
    <AppLayout title="My Matches">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold">My Matches</h1>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading matches...</p>
        ) : matches.length === 0 ? (
          <div className="card-base p-4">
            <p className="text-sm text-muted-foreground">
              No matches found yet.
            </p>
          </div>
        ) : (
          matches.map((match) => (
            <Link
              key={match.id}
              href={`/match/${match.id}`}
              className="card-base block p-4 transition hover:bg-muted"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold">
                    {match.team_a_name} vs {match.team_b_name}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {match.match_type} · {match.status}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {match.venue ?? "Venue not added"}
                    {match.city ? `, ${match.city}` : ""}
                  </p>
                </div>

                <span className="text-xs text-muted-foreground">
                  {new Date(match.completed_at ?? match.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </AppLayout>
  );
}