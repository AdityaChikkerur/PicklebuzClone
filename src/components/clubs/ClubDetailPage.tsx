"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { AppLayout } from "@/components/layout";
import { useClubDetail } from "@/hooks/useClubs";
import { ClubHeader } from "./ClubHeader";
import { CourtsList } from "./CourtsList";

interface ClubDetailPageProps {
  clubId: string;
}

export function ClubDetailPage({ clubId }: ClubDetailPageProps) {
  const router = useRouter();
  const { club, courts, loading, error } = useClubDetail(clubId);

  if (loading) {
    return (
      <AppLayout title="Club">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="h-48 animate-pulse rounded-2xl bg-muted" />
          <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        </div>
      </AppLayout>
    );
  }

  if (!club) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="text-xl font-bold text-foreground">Club not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Try{" "}
            <Link href="/club/club-1" className="text-primary underline">
              /club/club-1
            </Link>{" "}
            or browse{" "}
            <Link href="/clubs" className="text-primary underline">
              all clubs
            </Link>
          </p>
          <button
            type="button"
            onClick={() => router.push("/clubs")}
            className="btn-primary mt-6"
          >
            Browse clubs
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={club.name}>
      <div className="mx-auto flex max-w-3xl flex-col gap-5 md:gap-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          Back
        </button>

        {error && (
          <p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            {error}. Showing demo data.
          </p>
        )}

        <ClubHeader club={club} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Courts</h2>
            <p className="text-sm text-muted-foreground">
              {courts.length} court{courts.length !== 1 ? "s" : ""} · book by the hour
            </p>
          </div>
          <Link
            href={`/club/${club.id}/book`}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <CalendarDaysIcon className="h-5 w-5" aria-hidden="true" />
            Book a court
          </Link>
        </div>

        <CourtsList courts={courts} />
      </div>
    </AppLayout>
  );
}
