"use client";

import Link from "next/link";
import { CalendarIcon, MapPinIcon, ShareIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDate } from "@/lib/utils";
import { UPCOMING_TOURNAMENTS } from "./mockData";

const BANNER_GRADIENTS = ["gradient-green", "gradient-sky", "gradient-amber"] as const;

export function UpcomingTournamentsCard() {
  return (
    <div className="card-base overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-4 sm:p-5">
        <div>
          <h2 className="text-sm font-extrabold tracking-tight text-foreground">
            Tournaments
          </h2>
          <p className="text-xs text-muted-foreground">Register before deadlines close</p>
        </div>
        <Link
          href="/rankings"
          className="text-xs font-bold text-primary hover:underline"
        >
          Explore all
        </Link>
      </div>

      <ul className="flex flex-col gap-3 p-4 sm:p-5">
        {UPCOMING_TOURNAMENTS.map((tournament, index) => {
          const spotsLeft = tournament.maxParticipants - tournament.registeredCount;
          const fillPct = Math.round(
            (tournament.registeredCount / tournament.maxParticipants) * 100
          );
          const urgent = spotsLeft <= 4;

          return (
            <li
              key={tournament.id}
              className="card-surface overflow-hidden transition-shadow hover:shadow-card-hover"
            >
              <div
                className={cn("h-1.5 w-full", BANNER_GRADIENTS[index % BANNER_GRADIENTS.length])}
                aria-hidden="true"
              />
              <div className="p-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <Link
                    href={`/tournament/${tournament.id}`}
                    className="text-sm font-extrabold text-foreground hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    {tournament.name}
                  </Link>
                  <Badge variant="primary">{tournament.status}</Badge>
                </div>

                <div className="mb-3 flex flex-col gap-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {formatDate(tournament.startDate)} – {formatDate(tournament.endDate)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPinIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {tournament.venue}, {tournament.city}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="mb-1 flex justify-between text-[10px] font-bold">
                    <span className={urgent ? "text-red-brand" : "text-muted-foreground"}>
                      {spotsLeft} spots left
                    </span>
                    <span className="text-muted-foreground">{fillPct}% full</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        urgent ? "bg-red-brand" : "bg-primary"
                      )}
                      style={{ width: `${fillPct}%` }}
                      role="progressbar"
                      aria-valuenow={fillPct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/tournament/${tournament.id}/register`}
                    className="btn-primary flex-1 py-2 text-xs"
                  >
                    Register Now
                  </Link>
                  <button
                    type="button"
                    onClick={() => toast.info("Share link copied")}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Share tournament"
                  >
                    <ShareIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
