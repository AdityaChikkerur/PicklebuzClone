"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { Badge } from "@/components/ui/Badge";
import { useAdminTournaments } from "@/hooks/useAdminDashboard";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/lib/utils";
import { TOURNAMENT_FORMAT_LABELS } from "@/types/tournament";

const STATUS_VARIANT = {
  draft: "outline",
  upcoming: "primary",
  live: "live",
  completed: "success",
  cancelled: "danger",
} as const;

export function AdminTournamentsPage() {
  const profile = useAuthStore((s) => s.profile);
  const { tournaments, loading, toggleFeatured, toggleArchived } =
    useAdminTournaments();

  const isAdmin = profile?.role === "admin";

  if (!isAdmin) {
    return (
      <AppLayout title="Tournaments">
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
    <AppLayout title="Tournament management">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to admin
        </Link>

        {loading ? (
          <div className="card-base h-64 animate-pulse bg-muted/50" />
        ) : (
          <div className="card-base overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3">Tournament</th>
                    <th className="px-4 py-3">Format</th>
                    <th className="px-4 py-3">Starts</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Flags</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tournaments.map((t) => (
                    <tr
                      key={t.id}
                      className={`hover:bg-muted/30 ${t.archived ? "opacity-60" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/tournament/${t.id}`}
                          className="font-medium text-foreground hover:text-primary"
                        >
                          {t.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {t.city} · {t.createdByName}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {TOURNAMENT_FORMAT_LABELS[t.format]}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(t.startDate)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[t.status]}>
                          {t.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {t.featured && (
                            <Badge variant="secondary">Featured</Badge>
                          )}
                          {t.archived && (
                            <Badge variant="outline">Archived</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              toggleFeatured(t.id);
                              toast.success(
                                t.featured
                                  ? "Removed from featured"
                                  : "Tournament featured"
                              );
                            }}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            {t.featured ? "Unfeature" : "Feature"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              toggleArchived(t.id);
                              toast.success(
                                t.archived ? "Tournament restored" : "Archived"
                              );
                            }}
                            className="text-xs font-semibold text-muted-foreground hover:underline"
                          >
                            {t.archived ? "Restore" : "Archive"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
