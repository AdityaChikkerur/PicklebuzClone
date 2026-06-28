"use client";

import Link from "next/link";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import { AppLayout } from "@/components/layout";
import { Badge } from "@/components/ui/Badge";
import { useRefereeDashboard } from "@/hooks/useRefereeDashboard";
import { useAuthStore } from "@/store/authStore";
import { formatRelativeTime } from "@/lib/utils";

export function RefereeDashboardPage() {
  const profile = useAuthStore((s) => s.profile);
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const { matches, loading, source } = useRefereeDashboard(userId);

  const isReferee = profile?.role === "referee" || profile?.role === "admin";

  if (!isReferee) {
    return (
      <AppLayout title="Referee">
        <p className="text-center text-sm text-muted-foreground">
          Referee access required.
        </p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Referee">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardDocumentCheckIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-foreground">Assigned matches</h2>
            <p className="text-sm text-muted-foreground">
              Matches where you are the designated referee.
              {source === "mock" && " Showing demo data."}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="card-base h-40 animate-pulse bg-muted/50" />
        ) : matches.length === 0 ? (
          <div className="card-base px-6 py-10 text-center text-sm text-muted-foreground">
            No assigned matches right now. Organizers will assign you when a
            match needs officiating.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {matches.map((match) => (
              <li key={match.id} className="card-base p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">
                      {match.teamAName} vs {match.teamBName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(match.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge
                      variant={match.status === "live" ? "warning" : "secondary"}
                    >
                      {match.status}
                    </Badge>
                    {match.scoreFlagged && (
                      <Badge variant="danger">Flagged</Badge>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {match.status === "live" && (
                    <Link
                      href={`/live-scoring/${match.id}`}
                      className="btn-primary flex-1 text-center text-sm"
                    >
                      Open scorer
                    </Link>
                  )}
                  <Link
                    href={`/match/${match.id}`}
                    className="btn-outline flex-1 text-center text-sm"
                  >
                    Match details
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}
