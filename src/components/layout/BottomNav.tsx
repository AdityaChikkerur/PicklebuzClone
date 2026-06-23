"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignalIcon } from "@heroicons/react/24/outline";
import {
  HomeIcon,
  ChartBarIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  SignalIcon as SignalIconSolid,
} from "@heroicons/react/24/solid";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import { CreateActionSheet } from "./CreateActionSheet";
import { isNavItemActive } from "./navItems";

const NAV_ITEMS = [
  {
    id: "home",
    label: "Home",
    href: "/dashboard",
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
  },
  {
    id: "live",
    label: "Live",
    href: "/live-scoring",
    icon: SignalIcon,
    activeIcon: SignalIconSolid,
  },
  {
    id: "create",
    label: "Score",
    href: null,
    icon: PlusCircleIcon,
    activeIcon: PlusCircleIcon,
  },
  {
    id: "rankings",
    label: "Rankings",
    href: "/rankings",
    icon: ChartBarIcon,
    activeIcon: ChartBarIconSolid,
  },
  {
    id: "profile",
    label: "Profile",
    href: "/profile",
    icon: UserCircleIcon,
    activeIcon: UserCircleIconSolid,
  },
] as const;

const CREATE_PATHS = new Set([
  "/match-setup",
  "/live-scoring",
  "/discover",
  "/create-tournament",
]);

export function BottomNav() {
  const pathname = usePathname();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 shadow-[0_-4px_24px_rgba(15,23,42,0.06)] backdrop-blur-md md:hidden"
        aria-label="Mobile navigation"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 bottom-safe">
          {NAV_ITEMS.map((item) => {
            const isCreate = item.id === "create";
            const active = isCreate
              ? CREATE_PATHS.has(pathname)
              : item.href
                ? isNavItemActive(pathname, item.href)
                : false;
            const Icon = active ? item.activeIcon : item.icon;

            if (isCreate) {
              return (
                <li key={item.id} className="flex flex-1">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(true)}
                    className={cn(
                      "bottom-nav-item flex-1 -mt-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                      active && "active"
                    )}
                    aria-expanded={createOpen}
                    aria-haspopup="dialog"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full gradient-green text-white shadow-lg shadow-primary/30">
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
                  href={item.href!}
                  className={cn(
                    "bottom-nav-item flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    active && "active"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="flex h-7 w-7 items-center justify-center">
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <CreateActionSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
