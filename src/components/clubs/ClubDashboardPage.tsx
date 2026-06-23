"use client";

import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BanknotesIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  ClockIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { Badge } from "@/components/ui/Badge";
import { useClubCourts } from "@/hooks/useClubCourts";
import { useClubOwnerBookings } from "@/hooks/useClubOwnerBookings";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";
import { CommissionSummary } from "@/components/monetization";
import { CourtWizard } from "./CourtWizard";
import { CourtsList } from "./CourtsList";
import { OwnerBookingsTable } from "./OwnerBookingsTable";
import type { Court } from "@/types/club";

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function ClubDashboardPage() {
  const profile = useAuthStore((s) => s.profile);
  const {
    ownedClubs,
    bookings,
    loading,
    error,
    source,
    confirmBooking,
    cancelBooking,
  } = useClubOwnerBookings();

  const primaryClub = ownedClubs[0];
  const {
    courts,
    loading: courtsLoading,
    error: courtsError,
    saveCourt,
    reload: reloadCourts,
  } = useClubCourts(primaryClub?.id);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [savingCourt, setSavingCourt] = useState(false);

  const isOwner =
    profile?.role === "club_owner" || profile?.role === "admin";

  const todayBookings = useMemo(
    () =>
      bookings.filter(
        (b) => isToday(b.startAt) && b.status !== "cancelled"
      ),
    [bookings]
  );

  const pendingCount = useMemo(
    () => bookings.filter((b) => b.status === "pending").length,
    [bookings]
  );

  const todayRevenue = useMemo(
    () =>
      todayBookings
        .filter((b) => b.status === "confirmed")
        .reduce((sum, b) => sum + b.amount, 0),
    [todayBookings]
  );

  const upcoming = useMemo(
    () =>
      bookings
        .filter((b) => b.status !== "cancelled" && new Date(b.startAt) >= new Date())
        .slice(0, 10),
    [bookings]
  );

  if (!isOwner) {
    return (
      <AppLayout title="Club dashboard">
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-bold text-foreground">
            Club owner access only
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with the club owner demo account to manage bookings and courts.
          </p>
          <Link href="/auth" className="btn-primary mt-6 inline-block">
            Sign in
          </Link>
        </div>
      </AppLayout>
    );
  }

  const handleSaveCourt = async (form: {
    name: string;
    surface: string;
    pricePerHour: number;
    openFrom: string;
    openTo: string;
  }) => {
    if (!primaryClub) return;

    setSavingCourt(true);
    const saved = await saveCourt(
      {
        clubId: primaryClub.id,
        name: form.name,
        surface: form.surface,
        pricePerHour: form.pricePerHour,
        openFrom: form.openFrom,
        openTo: form.openTo,
      },
      editingCourt?.id
    );
    setSavingCourt(false);

    if (!saved) {
      toast.error("Failed to save court");
      return;
    }

    toast.success(editingCourt ? "Court updated" : "Court added");
    setWizardOpen(false);
    setEditingCourt(null);
    reloadCourts();
  };

  return (
    <AppLayout title="Club dashboard">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 md:gap-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Manage</p>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              {primaryClub?.name ?? "Your club"}
            </h2>
            {source === "mock" && (
              <Badge variant="outline" className="mt-2">
                Demo data
              </Badge>
            )}
          </div>
          {primaryClub && (
            <Link
              href={`/club/${primaryClub.id}`}
              className="btn-outline text-sm"
            >
              View public page
            </Link>
          )}
        </div>

        {error && (
          <p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            {error}
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={CalendarDaysIcon}
            label="Today's bookings"
            value={String(todayBookings.length)}
            loading={loading}
          />
          <KpiCard
            icon={BanknotesIcon}
            label="Revenue today"
            value={formatCurrency(todayRevenue)}
            loading={loading}
          />
          <KpiCard
            icon={ClockIcon}
            label="Pending"
            value={String(pendingCount)}
            loading={loading}
            highlight={pendingCount > 0}
          />
          <KpiCard
            icon={BuildingStorefrontIcon}
            label="Courts"
            value={String(
              source === "supabase" ? courts.length : primaryClub?.courtCount ?? "—"
            )}
            loading={loading || courtsLoading}
          />
        </div>

        <CommissionSummary grossRevenue={todayRevenue} />

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-foreground">Courts</h3>
            {primaryClub && (
              <button
                type="button"
                onClick={() => {
                  setEditingCourt(null);
                  setWizardOpen(true);
                }}
                className="btn-outline inline-flex items-center gap-1.5 text-sm"
              >
                <PlusIcon className="h-4 w-4" aria-hidden="true" />
                Add court
              </button>
            )}
          </div>
          {courtsError && (
            <p className="text-sm text-warning">{courtsError}</p>
          )}
          {courtsLoading ? (
            <div className="card-base h-32 animate-pulse bg-muted/50" />
          ) : courts.length === 0 ? (
            <div className="card-base px-6 py-10 text-center text-sm text-muted-foreground">
              No courts yet. Add your first court to accept bookings.
            </div>
          ) : (
            <div className="space-y-3">
              <CourtsList courts={courts} />
              <ul className="flex flex-wrap gap-2">
                {courts.map((court) => (
                  <li key={court.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCourt(court);
                        setWizardOpen(true);
                      }}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Edit {court.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-foreground">Upcoming bookings</h3>
          {loading ? (
            <div className="card-base h-48 animate-pulse bg-muted/50" />
          ) : (
            <OwnerBookingsTable
              bookings={upcoming}
              onConfirm={(id) => {
                void (async () => {
                  const ok = await confirmBooking(id);
                  if (ok) toast.success("Booking confirmed");
                  else toast.error("Failed to confirm booking");
                })();
              }}
              onCancel={(id) => {
                void (async () => {
                  const ok = await cancelBooking(id);
                  if (ok) toast.success("Booking cancelled");
                  else toast.error("Failed to cancel booking");
                })();
              }}
            />
          )}
        </section>

        {ownedClubs.length > 1 && (
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-foreground">Your clubs</h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {ownedClubs.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/club/${c.id}`}
                    className="card-base block p-4 hover:border-primary/30"
                  >
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.city}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {primaryClub && (
        <CourtWizard
          open={wizardOpen}
          clubName={primaryClub.name}
          court={editingCourt}
          saving={savingCourt}
          onClose={() => {
            setWizardOpen(false);
            setEditingCourt(null);
          }}
          onSave={(form) => void handleSaveCourt(form)}
        />
      )}
    </AppLayout>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  loading,
  highlight,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  loading?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`card-base p-4 ${highlight ? "border-warning/40 bg-warning/5" : ""}`}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-5 w-5" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      {loading ? (
        <div className="mt-2 h-8 w-16 animate-pulse rounded-lg bg-muted" />
      ) : (
        <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      )}
    </div>
  );
}
