"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { Badge } from "@/components/ui/Badge";
import { useAdminDisputes } from "@/hooks/useAdminDashboard";
import { flagMatchScore } from "@/lib/db/admin";
import { useAuthStore } from "@/store/authStore";
import { formatRelativeTime } from "@/lib/utils";

export function AdminDisputesPage() {
  const profile = useAuthStore((s) => s.profile);
  const { disputes, loading, resolveDispute } = useAdminDisputes();

  const isAdmin = profile?.role === "admin";
  const openCount = disputes.filter((d) => d.status === "open").length;

  if (!isAdmin) {
    return (
      <AppLayout title="Disputes">
        <p className="text-center text-sm text-muted-foreground">
          Admin access required.{" "}
          <Link href="/auth" className="text-primary underline">
            Sign in
          </Link>
        </p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dispute resolution">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to admin
        </Link>

        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-foreground">Dispute queue</h2>
          {openCount > 0 && (
            <Badge variant="warning">{openCount} open</Badge>
          )}
        </div>

        {loading ? (
          <div className="card-base h-48 animate-pulse bg-muted/50" />
        ) : disputes.length === 0 ? (
          <div className="card-base px-6 py-10 text-center text-sm text-muted-foreground">
            No disputes on record.
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {disputes.map((d) => (
              <li key={d.id} className="card-base p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">
                      {d.matchTitle}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Raised by {d.raisedByName} ·{" "}
                      {formatRelativeTime(d.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={d.status === "open" ? "warning" : "success"}
                  >
                    {d.status}
                  </Badge>
                </div>

                <p className="mt-3 text-sm text-foreground">{d.reason}</p>

                <p className="mt-2 text-xs text-muted-foreground">
                  Creator: {d.creatorName} · Opponent: {d.opponentName}
                </p>

                {d.status === "open" ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        resolveDispute(d.id, "uphold_creator");
                        toast.success("Upholding creator — match verified");
                      }}
                      className="btn-primary px-3 py-1.5 text-xs"
                    >
                      Uphold creator
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resolveDispute(d.id, "uphold_opponent");
                        toast.success("Upholding opponent — score adjusted");
                      }}
                      className="btn-outline px-3 py-1.5 text-xs"
                    >
                      Uphold opponent
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resolveDispute(d.id, "resolved");
                        toast.success("Dispute marked resolved");
                      }}
                      className="btn-outline px-3 py-1.5 text-xs"
                    >
                      Mark resolved
                    </button>
                    <Link
                      href={`/match/${d.matchId}`}
                      className="btn-outline px-3 py-1.5 text-xs"
                    >
                      View match
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        void flagMatchScore(d.matchId, true).then((result) => {
                          if (result.error) toast.error(result.error);
                          else toast.success("Match flagged for review");
                        });
                      }}
                      className="btn-outline px-3 py-1.5 text-xs text-warning"
                    >
                      Flag score
                    </button>
                  </div>
                ) : (
                  <p className="mt-3 text-xs font-medium text-success">
                    Resolved: {d.resolution?.replace(/_/g, " ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}
