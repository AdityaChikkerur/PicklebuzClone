"use client";

import Link from "next/link";
import {
  BanknotesIcon,
  CalendarDaysIcon,
  PlusCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { Badge } from "@/components/ui/Badge";
import { KpiCard } from "@/components/ui/KpiCard";
import { FeaturedListingUpsell } from "@/components/monetization";
import { useFeaturedListing } from "@/hooks/useFeaturedListing";
import { useOrganizerDashboard } from "@/hooks/useOrganizerDashboard";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { TOURNAMENT_FORMAT_LABELS } from "@/types/tournament";

const STATUS_VARIANT = {
  draft: "outline",
  upcoming: "primary",
  live: "live",
  completed: "success",
  cancelled: "danger",
} as const;

export function OrganizerDashboardPage() {
  const profile = useAuthStore((s) => s.profile);
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const { isFeatured, toggleFeatured } = useFeaturedListing(userId);
  const {
    tournaments,
    pendingApprovals,
    stats,
    loading,
    source,
    approveRegistration,
    rejectRegistration,
  } = useOrganizerDashboard();

  const isOrganizer =
    profile?.role === "organizer" || profile?.role === "admin";

  if (!isOrganizer) {
    return (
      <AppLayout title="Organizer">
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <CalendarDaysIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-bold text-foreground">
            Organizer access only
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with the organizer demo account to manage tournaments and
            registrations.
          </p>
          <Link href="/auth" className="btn-primary mt-6 inline-block">
            Sign in
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Organizer">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 md:gap-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Manage events</p>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Organizer dashboard
            </h2>
            {source === "mock" && (
              <Badge variant="outline" className="mt-2">
                Demo data
              </Badge>
            )}
          </div>
          <Link href="/create-tournament" className="btn-primary text-sm">
            <PlusCircleIcon className="mr-1.5 inline h-4 w-4" />
            Create tournament
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={CalendarDaysIcon}
            label="Events"
            value={String(stats.eventCount)}
            loading={loading}
          />
          <KpiCard
            icon={UserGroupIcon}
            label="Total players"
            value={String(stats.totalPlayers)}
            loading={loading}
          />
          <KpiCard
            icon={BanknotesIcon}
            label="Fees collected"
            value={formatCurrency(stats.feesCollected)}
            loading={loading}
          />
          <KpiCard
            icon={UserGroupIcon}
            label="Pending approvals"
            value={String(stats.pendingApprovals)}
            loading={loading}
            highlight={stats.pendingApprovals > 0}
          />
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-foreground">
              Approval inbox
            </h3>
            {stats.pendingApprovals > 0 && (
              <Badge variant="warning">{stats.pendingApprovals} pending</Badge>
            )}
          </div>
          {loading ? (
            <div className="card-base h-32 animate-pulse bg-muted/50" />
          ) : pendingApprovals.length === 0 ? (
            <div className="card-base px-6 py-10 text-center text-sm text-muted-foreground">
              No pending registrations.
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {pendingApprovals.map((item) => (
                <li
                  key={item.registrationId}
                  className="card-base flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">
                      {item.playerName}
                      {item.partnerName && (
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          + {item.partnerName}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.tournamentName} · {item.categoryLabel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(item.registeredAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        approveRegistration(
                          item.registrationId,
                          item.tournamentId
                        )
                      }
                      className="btn-primary px-3 py-1.5 text-xs"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        rejectRegistration(
                          item.registrationId,
                          item.tournamentId
                        )
                      }
                      className="btn-outline px-3 py-1.5 text-xs text-danger"
                    >
                      Reject
                    </button>
                    <Link
                      href={`/tournament/${item.tournamentId}`}
                      className="btn-outline px-3 py-1.5 text-xs"
                    >
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-foreground">Your tournaments</h3>
          {loading ? (
            <div className="card-base h-48 animate-pulse bg-muted/50" />
          ) : (
            <ul className="flex flex-col gap-2">
              {tournaments.map((t) => (
                <li key={t.id} className="flex flex-col gap-2">
                  <Link
                    href={`/tournament/${t.id}`}
                    className="card-base flex flex-wrap items-center justify-between gap-3 p-4 hover:border-primary/30"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{t.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t.city} ·{" "}
                        {t.format
                          ? TOURNAMENT_FORMAT_LABELS[t.format]
                          : "Tournament"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_VARIANT[t.status]}>
                        {t.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {t.registeredCount}/{t.maxParticipants} players
                      </span>
                    </div>
                  </Link>
                  {(t.status === "upcoming" || t.status === "live") && (
                    <FeaturedListingUpsell
                      tournamentId={t.id}
                      tournamentName={t.name}
                      featured={isFeatured(t.id)}
                      onToggle={() => void toggleFeatured(t.id, t.name)}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
