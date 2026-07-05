"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

  useEffect(() => {
    async function loadTournaments() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("tournaments")
        .select("id, name, city, start_date, status")
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

  return (
    <AppLayout title="Tournaments">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Explore events</p>
          <h1 className="text-2xl font-bold text-foreground">Tournaments</h1>
        </div>

        <Link
          href="/create-tournament"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          + Create
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading tournaments...</p>
      ) : tournaments.length === 0 ? (
        <div className="card-base p-4">
          <p className="text-sm text-muted-foreground">
            No tournaments created yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="card-base p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">{tournament.name}</h3>

                  <p className="text-sm text-muted-foreground">
                    {tournament.city ?? "City not added"}
                    {tournament.start_date
                      ? ` • ${new Date(tournament.start_date).toLocaleDateString()}`
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
                  className="text-sm font-medium text-primary"
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