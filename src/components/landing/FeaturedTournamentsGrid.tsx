import Link from "next/link";
import {
  CalendarIcon,
  MapPinIcon,
  TrophyIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { AdminTournamentRow } from "@/types/admin";
import { TOURNAMENT_FORMAT_LABELS } from "@/types/tournament";

interface FeaturedTournamentsGridProps {
  tournaments: AdminTournamentRow[];
}

export function FeaturedTournamentsGrid({
  tournaments,
}: FeaturedTournamentsGridProps) {
  return (
    <section id="featured-tournaments" className="scroll-mt-20">
      <div className="mb-5">
        <h2 className="font-display text-lg font-black italic text-foreground">
          Featured tournaments
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Curated events from organizers across India
        </p>
      </div>

      {tournaments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Featured events will appear here once organizers publish tournaments.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
        {tournaments.map((tournament) => {
          const fillPct = Math.round(
            (tournament.registeredCount / tournament.maxParticipants) * 100
          );

          return (
            <Link
              key={tournament.id}
              href={`/tournament/${tournament.id}`}
              className="card-glow group overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:border-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="relative h-24 bg-gradient-to-br from-primary/20 via-arena-surface to-background">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iI2M4ZmYwMCIgZmlsbC1vcGFjaXR5PSIwLjE1Ii8+PC9jaXJjbGU+PC9zdmc+')] opacity-80" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <TrophyIcon
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                  />
                  <Badge variant="primary">Featured</Badge>
                </div>
              </div>

              <div className="relative z-10 p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-bold text-foreground transition-colors group-hover:text-primary">
                    {tournament.name}
                  </h3>
                  <Badge variant="primary">{tournament.status}</Badge>
                </div>

                <p className="mb-3 text-xs text-muted-foreground">
                  {TOURNAMENT_FORMAT_LABELS[tournament.format]}
                </p>

                <div className="mb-3 flex flex-col gap-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarIcon
                      className="h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    {formatDate(tournament.startDate)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPinIcon
                      className="h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    {tournament.city}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <UsersIcon
                      className="h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    {tournament.registeredCount}/{tournament.maxParticipants}{" "}
                    registered
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full gradient-neon transition-all"
                    style={{ width: `${fillPct}%` }}
                    role="progressbar"
                    aria-valuenow={fillPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${fillPct}% filled`}
                  />
                </div>
              </div>
            </Link>
          );
        })}
        </div>
      )}
    </section>
  );
}
