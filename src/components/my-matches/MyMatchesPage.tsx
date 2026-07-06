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
  winner: "A" | "B" | null;
  venue: string | null;
  city: string | null;
  created_at: string;
  completed_at: string | null;
  my_team: "A" | "B";
};

export function MyMatchesPage() {
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [filter, setFilter] = useState<"all" | "won" | "lost">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function loadMatches() {
      setLoading(true);
      const supabase = createClient();

      const { data: matchPlayers, error: mpError } = await supabase
        .from("match_players")
        .select("match_id, team")
        .eq("player_id", userId);

      if (mpError || !matchPlayers?.length) {
        setMatches([]);
        setLoading(false);
        return;
      }

      const matchIds = matchPlayers.map((row) => row.match_id as string);
      const teamByMatchId = new Map(
        matchPlayers.map((row) => [
          row.match_id as string,
          row.team as "A" | "B",
        ])
      );

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
        const mapped = (data ?? []).map((match) => ({
          ...(match as Omit<MatchRow, "my_team">),
          my_team: teamByMatchId.get(match.id as string) ?? "A",
        }));

        setMatches(mapped);
      }

      setLoading(false);
    }

    void loadMatches();
  }, [userId]);

  const filteredMatches = matches.filter((match) => {
    if (filter === "all") return true;
    if (!match.winner) return false;

    const didWin = match.winner === match.my_team;

    if (filter === "won") return didWin;
    if (filter === "lost") return !didWin;

    return true;
  });

  return (
    <AppLayout title="My Matches">
      <div className="mx-auto max-w-3xl space-y-4">
        <div>
          <h1 className="text-2xl font-bold">My Matches</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View your recent matches and results.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              filter === "all"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setFilter("won")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              filter === "won"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Won
          </button>

          <button
            type="button"
            onClick={() => setFilter("lost")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              filter === "lost"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Lost
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading matches...</p>
        ) : filteredMatches.length === 0 ? (
          <div className="card-base p-4">
            <p className="text-sm text-muted-foreground">
              No matches found for this filter.
            </p>
          </div>
        ) : (
          filteredMatches.map((match) => {
            const didWin = match.winner === match.my_team;
            const isCompleted = Boolean(match.winner);

            return (
              <Link
                key={match.id}
                href={`/match/${match.id}`}
                className="card-base block p-4 transition hover:bg-muted"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-bold">
                      {match.team_a_name} vs {match.team_b_name}
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {match.match_type} · {match.status}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {match.venue ?? "Venue not added"}
                      {match.city ? `, ${match.city}` : ""}
                    </p>

                    {isCompleted && (
                      <span
                        className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          didWin
                            ? "bg-primary/15 text-primary"
                            : "bg-danger/15 text-danger"
                        }`}
                      >
                        {didWin ? "Won" : "Lost"}
                      </span>
                    )}
                  </div>

                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(
                      match.completed_at ?? match.created_at
                    ).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </AppLayout>
  );
}