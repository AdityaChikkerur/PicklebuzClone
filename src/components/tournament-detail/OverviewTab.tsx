"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { SponsorBannerSlot } from "@/components/monetization";
import { formatCurrency } from "@/lib/utils";
import {
  getCategoryDisplayName,
  type TournamentDetail,
} from "@/types/tournament";

interface OverviewTabProps {
  tournament: TournamentDetail;
}

export function OverviewTab({ tournament }: OverviewTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="card-base p-4 sm:p-5">
        <h2 className="mb-2 text-sm font-bold text-foreground">About</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {tournament.description}
        </p>
        {tournament.clubId ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Venue:{" "}
            <Link
              href={`/club/${tournament.clubId}`}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {tournament.venue}
            </Link>
            {tournament.address ? ` · ${tournament.address}` : null}
          </p>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">{tournament.address}</p>
        )}
      </div>

      <div className="card-base p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-bold text-foreground">Categories</h2>
        <ul className="flex flex-col gap-3">
          {tournament.categories.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {getCategoryDisplayName(cat)}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {!cat.name && (
                    <Badge variant="outline">{cat.skillLevel}</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Max {cat.maxTeams} teams
                  </span>
                </div>
              </div>
              <span className="text-sm font-bold text-foreground">
                {formatCurrency(cat.entryFee)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card-base p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-bold text-foreground">Match rules</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">Scoring</dt>
            <dd className="font-semibold capitalize text-foreground">
              {tournament.scoringType}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Points to win</dt>
            <dd className="font-semibold text-foreground">{tournament.pointsToWin}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Best of</dt>
            <dd className="font-semibold text-foreground">{tournament.bestOf}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Win by</dt>
            <dd className="font-semibold text-foreground">{tournament.winBy}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Timeouts</dt>
            <dd className="font-semibold text-foreground">
              {tournament.maxTimeouts} × {tournament.timeoutDuration}s
            </dd>
          </div>
        </dl>
      </div>

      {tournament.userRegistration && (
        <div className="card-base border-primary/30 bg-primary/5 p-4 sm:p-5">
          <h2 className="mb-2 text-sm font-bold text-foreground">Your registration</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                tournament.userRegistration.status === "approved"
                  ? "success"
                  : tournament.userRegistration.status === "pending"
                    ? "warning"
                    : "danger"
              }
            >
              {tournament.userRegistration.status}
            </Badge>
            {tournament.userRegistration.partnerName && (
              <span className="text-sm text-muted-foreground">
                Partner: {tournament.userRegistration.partnerName}
              </span>
            )}
          </div>
        </div>
      )}

      <SponsorBannerSlot />
    </div>
  );
}
