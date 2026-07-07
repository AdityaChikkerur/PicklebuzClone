"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { AppLayout } from "@/components/layout";
import { createClient } from "@/lib/supabase";

type Tournament = {
  id: string;
  name: string;
  city?: string | null;
  start_date?: string | null;
  status?: string | null;
};

export default function TournamentPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadTournaments() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("tournaments")
        .select("id, name, city, start_date, status")
        .neq("status", "completed")
        .order("start_date", { ascending: true });

      if (error) {
        console.error("Error loading tournaments:", error);
      } else {
        setTournaments(data ?? []);
      }

      setLoading(false);
    }

    loadTournaments();
  }, []);

  const filteredTournaments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return tournaments;

    return tournaments.filter((tournament) => {
      const name = tournament.name?.toLowerCase() ?? "";
      const city = tournament.city?.toLowerCase() ?? "";
      const status = tournament.status?.toLowerCase() ?? "";
      const date = tournament.start_date
        ? new Date(tournament.start_date).toLocaleDateString().toLowerCase()
        : "";

      return (
        name.includes(query) ||
        city.includes(query) ||
        status.includes(query) ||
        date.includes(query)
      );
    });
  }, [tournaments, searchQuery]);

  return (
    <AppLayout title="Tournaments">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Explore events</p>
          <h1 className="text-2xl font-bold text-foreground">Tournaments</h1>
        </div>

        <Link href="/create-tournament" className="btn-primary px-4 py-2 text-sm">
          + Create
        </Link>
      </div>

      <div className="relative mb-5">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tournaments by name, city, or status..."
          className="w-full rounded-2xl border border-border bg-card px-10 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading tournaments...</p>
      ) : tournaments.length === 0 ? (
        <div className="card-base p-4">
          <p className="text-sm text-muted-foreground">
            No tournaments created yet.
          </p>
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="card-base p-4">
          <p className="text-sm font-medium text-foreground">
            No tournaments found.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try searching by tournament name, city, or status.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTournaments.map((tournament) => (
            <div key={tournament.id} className="card-base p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold">
                    {tournament.name}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {tournament.city ?? "City not added"}
                    {tournament.start_date
                      ? ` • ${new Date(
                          tournament.start_date
                        ).toLocaleDateString()}`
                      : ""}
                  </p>

                  {tournament.status && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Status: {tournament.status}
                    </p>
                  )}
                </div>

                <Link
                  href={`/tournament/${tournament.id}`}
                  className="shrink-0 text-sm font-medium text-primary"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}