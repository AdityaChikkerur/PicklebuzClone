"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { AppIcon } from "@/components/ui/AppIcon";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { getTimeGreeting } from "@/lib/greeting";
import { useAuthStore } from "@/store/authStore";

export function DashboardHeader() {
  const profile = useAuthStore((s) => s.profile);
  const displayName = profile?.fullName ?? "Player";
  const firstName = displayName.split(" ")[0];

  return (
    <header className="sticky top-0 z-40 -mx-4 glass border-b border-border px-4 py-3 md:-mx-6 md:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden h-10 w-10 items-center justify-center rounded-xl gradient-neon shadow-neon-sm sm:flex">
            <AppIcon size={24} variant="neon-bg" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-muted-foreground">
              {getTimeGreeting()},
            </p>
            <h1 className="font-display truncate text-lg font-black italic tracking-tight text-foreground sm:text-xl">
              {firstName}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-muted/60 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Search"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
          <NotificationBell />
          <AccountMenu variant="compact" />
        </div>
      </div>
    </header>
  );
}
