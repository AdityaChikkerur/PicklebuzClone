"use client";

import Link from "next/link";
import {
  PlusCircleIcon,
  SignalIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

const ACTIONS = [
  {
    label: "Create Match",
    href: "/match-setup",
    icon: PlusCircleIcon,
    gradient: "gradient-neon",
    glow: "shadow-neon-sm",
  },
  {
    label: "Live matches",
    href: "/live-scoring",
    icon: SignalIcon,
    gradient: "gradient-amber",
    glow: "shadow-md",
  },
  {
    label: "Find Partner",
    href: "/discover",
    icon: UserGroupIcon,
    gradient: "gradient-sky",
    glow: "shadow-md",
  },
  {
    label: "Book Court",
    href: "/clubs",
    icon: BuildingStorefrontIcon,
    gradient: "glass-strong",
    glow: "",
  },
] as const;

export function QuickActionsGrid() {
  return (
    <section aria-label="Quick actions">
      <div className="grid grid-cols-4 gap-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const content = (
            <>
              <span
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground transition-all duration-200 active:scale-95 hover:scale-105",
                  action.gradient,
                  action.glow,
                  action.gradient === "glass-strong" && "text-primary border border-primary/20"
                )}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="text-center text-[11px] font-bold leading-tight text-foreground">
                {action.label}
              </span>
            </>
          );

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
