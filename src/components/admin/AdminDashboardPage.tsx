"use client";

import Link from "next/link";
import {
  BuildingStorefrontIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  TrophyIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { AppLayout } from "@/components/layout";
import { Badge } from "@/components/ui/Badge";
import { KpiCard } from "@/components/ui/KpiCard";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useAuthStore } from "@/store/authStore";

const ADMIN_SECTIONS = [
  {
    href: "/admin/users",
    title: "User management",
    description: "Search, verify, ban, or boost player profiles.",
    icon: UserGroupIcon,
  },
  {
    href: "/admin/disputes",
    title: "Dispute resolution",
    description: "Review disputed match results and uphold outcomes.",
    icon: ExclamationTriangleIcon,
  },
  {
    href: "/admin/tournaments",
    title: "Tournament management",
    description: "Feature listings or archive completed events.",
    icon: TrophyIcon,
  },
  {
    href: "/admin/flagged",
    title: "Fake-score flags",
    description: "Review matches flagged for suspicious scores.",
    icon: ShieldCheckIcon,
  },
] as const;

export function AdminDashboardPage() {
  const profile = useAuthStore((s) => s.profile);
  const { stats, loading, source } = useAdminDashboard();

  const isAdmin = profile?.role === "admin";

  if (!isAdmin) {
    return (
      <AppLayout title="Admin">
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-bold text-foreground">
            Admin access only
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with the admin demo account to manage the platform.
          </p>
          <Link href="/auth" className="btn-primary mt-6 inline-block">
            Sign in
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Admin">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 md:gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Platform control</p>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Admin dashboard
          </h2>
          {source === "mock" && (
            <Badge variant="outline" className="mt-2">
              Demo data
            </Badge>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={UserGroupIcon}
            label="Users"
            value={String(stats.userCount)}
            loading={loading}
          />
          <KpiCard
            icon={TrophyIcon}
            label="Tournaments"
            value={String(stats.tournamentCount)}
            loading={loading}
          />
          <KpiCard
            icon={BuildingStorefrontIcon}
            label="Clubs"
            value={String(stats.clubCount)}
            loading={loading}
          />
          <KpiCard
            icon={ExclamationTriangleIcon}
            label="Open disputes"
            value={String(stats.openDisputes)}
            loading={loading}
            highlight={stats.openDisputes > 0}
          />
        </div>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-foreground">Sections</h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            {ADMIN_SECTIONS.map((section) => (
              <li key={section.title}>
                <Link
                  href={section.href}
                  className="card-base flex h-full gap-4 p-4 hover:border-primary/30"
                >
                  <section.icon className="h-8 w-8 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">
                      {section.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppLayout>
  );
}
