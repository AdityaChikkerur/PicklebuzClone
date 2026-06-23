"use client";

import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { AppIcon } from "@/components/ui/AppIcon";
import { Avatar } from "@/components/ui";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { getTimeGreeting } from "@/lib/greeting";
import { avatarUrl } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

export function DashboardHeader() {
  const profile = useAuthStore((s) => s.profile);
  const displayName = profile?.fullName ?? "Player";
  const firstName = displayName.split(" ")[0];
  const avatar = profile?.avatarUrl ?? avatarUrl(displayName.toLowerCase().replace(/\s+/g, "-"));

  return (
    <header className="sticky top-0 z-40 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md md:-mx-6 md:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden h-9 w-9 items-center justify-center rounded-xl gradient-green shadow-sm sm:flex">
            <AppIcon size={20} className="text-white" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-muted-foreground">
              {getTimeGreeting()},
            </p>
            <h1 className="truncate text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
              {firstName}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Search"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
          <NotificationBell />
          <Link
            href="/profile"
            className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="View profile"
          >
            <Avatar src={avatar} name={displayName} size="sm" ring />
          </Link>
        </div>
      </div>
    </header>
  );
}
