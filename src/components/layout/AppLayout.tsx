"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import { avatarUrl, cn } from "@/lib/utils";
import { BottomNav } from "./BottomNav";
import { NotificationBell } from "./NotificationBell";
import { Sidebar } from "./Sidebar";

const FALLBACK_PROFILE = {
  fullName: "Arjun Mehta",
  avatarUrl: avatarUrl("arjun-mehta"),
};

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  /** Hide sidebar and bottom nav (e.g. live scoring fullscreen) */
  hideNav?: boolean;
  /** Hide the top header bar (e.g. dashboard uses its own header) */
  hideHeader?: boolean;
}

export function AppLayout({ children, title, hideNav = false, hideHeader = false }: AppLayoutProps) {
  const profile = useAuthStore((s) => s.profile);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("picklebuzz-sidebar-collapsed");
    if (stored === "true") {
      setCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("picklebuzz-sidebar-collapsed", String(next));
      return next;
    });
  };

  const displayName = profile?.fullName ?? FALLBACK_PROFILE.fullName;
  const displayAvatar = profile?.avatarUrl ?? FALLBACK_PROFILE.avatarUrl;

  if (hideNav) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out",
          collapsed ? "md:pl-16" : "md:pl-60"
        )}
      >
        {!hideHeader && (
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between gap-4 px-4 md:h-16 md:px-6">
            <div className="flex min-w-0 items-center gap-3 md:hidden">
              <Link
                href="/dashboard"
                className="truncate text-base font-bold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
              >
                {title ?? "PickleBuzz"}
              </Link>
            </div>

            {title && (
              <h1 className="hidden truncate text-lg font-bold text-foreground md:block">
                {title}
              </h1>
            )}

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <NotificationBell />
              <Link
                href="/profile"
                className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="View profile"
              >
                <Avatar src={displayAvatar} name={displayName} size="sm" ring />
              </Link>
            </div>
          </div>
        </header>
        )}

        <main className="flex-1 px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-6">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
