"use client";

import Link from "next/link";
import {
  CalendarIcon,
  MapPinIcon,
  SunIcon,
  TrophyIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import {
  TOURNAMENT_FORMAT_LABELS,
  type TournamentDetail,
  type TournamentStatus,
} from "@/types/tournament";

interface TournamentHeaderProps {
  tournament: TournamentDetail;
  onRegister?: () => void;
}

function statusVariant(
  status: TournamentStatus
): "success" | "warning" | "danger" | "primary" | "default" {
  switch (status) {
    case "live":
      return "danger";
    case "upcoming":
      return "primary";
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "default";
  }
}

export function TournamentHeader({ tournament, onRegister }: TournamentHeaderProps) {
  const spotsLeft = tournament.maxParticipants - tournament.registeredCount;
  const fillPct = Math.round(
    (tournament.registeredCount / tournament.maxParticipants) * 100
  );
  const deadlinePassed =
    Date.now() >
    new Date(`${tournament.registrationDeadline}T23:59:59`).getTime();
  const usesExternalRegistration = Boolean(tournament.registrationUrl);

  const registrationLabel = tournament.userRegistration
    ? tournament.userRegistration.status === "approved"
      ? "Registered"
      : tournament.userRegistration.status === "pending"
        ? "Registration Pending"
        : "Registration Rejected"
    : usesExternalRegistration
      ? "View registration"
      : "Register";

  return (
    <div className="card-base overflow-hidden">
      <div className="relative h-28 bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/20 sm:h-36">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9jaXJjbGU+PC9zdmc+')] opacity-60" />
        <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-end justify-between gap-2">
          <Badge variant={statusVariant(tournament.status)} dot={tournament.status === "live"}>
            {tournament.status}
          </Badge>
          {tournament.format && (
            <Badge variant="outline" className="bg-card/80 backdrop-blur-sm">
              {TOURNAMENT_FORMAT_LABELS[tournament.format]}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            {tournament.name}
          </h1>
          {tournament.prize && (
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-warning">
              <TrophyIcon className="h-4 w-4" aria-hidden="true" />
              {tournament.prize}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {formatDate(tournament.startDate)} – {formatDate(tournament.endDate)}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {tournament.clubId ? (
              <Link
                href={`/club/${tournament.clubId}`}
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                {tournament.venue}, {tournament.city}
              </Link>
            ) : (
              <>
                {tournament.venue}, {tournament.city}
              </>
            )}
          </span>
          <span className="inline-flex items-center gap-2">
            <UsersIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {tournament.registeredCount}/{tournament.maxParticipants} registered
            · {spotsLeft} spots left
          </span>
          {tournament.weather && (
            <span className="inline-flex items-center gap-2">
              <SunIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {tournament.weather}
            </span>
          )}
        </div>

        <div>
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Registration fill</span>
            <span>{fillPct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${fillPct}%` }}
              role="progressbar"
              aria-valuenow={fillPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Deadline: {formatDate(tournament.registrationDeadline)}
          </p>
        </div>

        {tournament.sponsors && tournament.sponsors.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sponsors
            </p>
            <div className="flex flex-wrap gap-2">
              {tournament.sponsors.map((sponsor) => (
                <span
                  key={sponsor}
                  className="rounded-lg border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-foreground"
                >
                  {sponsor}
                </span>
              ))}
            </div>
          </div>
        )}

        {usesExternalRegistration && !deadlinePassed && (
          <p className="text-xs text-muted-foreground">
            Registration is on the{" "}
            <a
              href={tournament.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline"
            >
              official registration site
            </a>
            . PickleBuzz shows live scores and tournament info.
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          {!deadlinePassed && (
            tournament.userRegistration && !usesExternalRegistration ? (
              <Link
                href={`/tournament/${tournament.id}/register`}
                className="btn-outline text-center text-sm"
              >
                {registrationLabel}
              </Link>
            ) : usesExternalRegistration ? (
              <a
                href={tournament.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-center text-sm"
              >
                Register Now
              </a>
            ) : (
              <button
                type="button"
                onClick={onRegister}
                className="btn-primary text-sm"
              >
                Register Now
              </button>
            )
          )}
          {tournament.isOrganizer && (
            <span className="inline-flex items-center justify-center rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-2 text-xs font-semibold text-secondary">
              Organizer view
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
