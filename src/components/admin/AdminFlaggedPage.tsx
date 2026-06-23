"use client";

import Link from "next/link";
import { ArrowLeftIcon, FlagIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { Badge } from "@/components/ui/Badge";
import { useAdminFlaggedMatches } from "@/hooks/useAdminDashboard";
import { useAuthStore } from "@/store/authStore";
import { formatRelativeTime } from "@/lib/utils";

export function AdminFlaggedPage() {
  const profile = useAuthStore((s) => s.profile);
  const { matches, loading, toggleFlag } = useAdminFlaggedMatches();

  const isAdmin = profile?.role === "admin";

  if (!isAdmin) {
    return (
      <AppLayout title="Flagged scores">
        <p className="text-center text-sm text-muted-foreground">
          Admin access required.
        </p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Flagged scores">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to admin
        </Link>

        <div className="flex items-center gap-2">
          <FlagIcon className="h-5 w-5 text-warning" aria-hidden="true" />
          <h2 className="text-lg font-bold text-foreground">
            Suspicious score flags
          </h2>
        </div>

        <p className="text-sm text-muted-foreground">
          Matches flagged for review. Clear the flag after investigation.
        </p>

        {loading ? (
          <div className="card-base h-48 animate-pulse bg-muted/50" />
        ) : matches.length === 0 ? (
          <div className="card-base px-6 py-10 text-center text-sm text-muted-foreground">
            No flagged matches.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {matches.map((m) => (
              <li key={m.id} className="card-base p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">
                      {m.teamAName} vs {m.teamBName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(m.createdAt)} · {m.status}
                    </p>
                  </div>
                  <Badge variant="warning">Flagged</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/match/${m.id}`}
                    className="btn-outline px-3 py-1.5 text-xs"
                  >
                    View match
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      void toggleFlag(m.id, false).then((ok) => {
                        if (ok) toast.success("Flag cleared");
                      });
                    }}
                    className="btn-primary px-3 py-1.5 text-xs"
                  >
                    Clear flag
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}
