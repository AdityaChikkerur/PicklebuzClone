"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { CreateActionSheet } from "./CreateActionSheet";
import { getBottomNavForRole, isNavItemActive } from "./navItems";

const CREATE_PATHS = new Set([
  "/match-setup",
  "/live-scoring",
  "/discover",
  "/create-tournament",
]);

export function BottomNav() {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.profile?.role);
  const navItems = getBottomNavForRole(role);
  const [createOpen, setCreateOpen] = useState(false);

  const playerCreateCenter =
    !role || role === "player"
      ? navItems.find((item) => item.id === "create")
      : null;

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 glass-strong border-t border-border shadow-[0_-8px_32px_rgba(0,0,0,0.4)] md:hidden"
        aria-label="Mobile navigation"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 bottom-safe">
          {navItems.map((item) => {
            const isPlayerCreate =
              playerCreateCenter?.id === item.id && item.id === "create";
            const active = isPlayerCreate
              ? CREATE_PATHS.has(pathname)
              : isNavItemActive(pathname, item.href);
            const Icon = active ? item.activeIcon : item.icon;

            if (isPlayerCreate) {
              return (
                <li key={item.id} className="flex flex-1">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(true)}
                    className={cn(
                      "bottom-nav-item flex-1 -mt-5",
                      active && "active"
                    )}
                    aria-expanded={createOpen}
                    aria-haspopup="dialog"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-neon text-primary-foreground shadow-neon transition-transform active:scale-95">
                      <Icon className="h-7 w-7 shrink-0" aria-hidden="true" />
                    </span>
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            }

            return (
              <li key={item.id} className="flex flex-1">
                <Link
                  href={item.href}
                  className={cn(
                    "bottom-nav-item flex-1",
                    active && "active"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center transition-transform duration-200",
                      active && "scale-110"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {playerCreateCenter ? (
        <CreateActionSheet open={createOpen} onClose={() => setCreateOpen(false)} />
      ) : null}
    </>
  );
}
