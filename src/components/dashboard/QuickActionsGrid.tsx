"use client";

import Link from "next/link";
import { toast } from "sonner";
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
    gradient: "gradient-green",
  },
  {
    label: "Live Score",
    href: "/live-scoring",
    icon: SignalIcon,
    gradient: "gradient-amber",
  },
  {
    label: "Find Partner",
    href: "/discover",
    icon: UserGroupIcon,
    gradient: "gradient-sky",
    comingSoon: false,
  },
  {
    label: "Book Court",
    href: "/clubs",
    icon: BuildingStorefrontIcon,
    gradient: "bg-secondary",
    comingSoon: false,
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
                  "flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform active:scale-95",
                  action.gradient,
                  action.gradient === "bg-secondary" && "shadow-secondary/30",
                  action.gradient.startsWith("gradient") && "shadow-primary/25"
                )}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="text-center text-[11px] font-bold leading-tight text-foreground">
                {action.label}
              </span>
            </>
          );

          if ("comingSoon" in action && action.comingSoon) {
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => toast.info("Coming soon!")}
                className="flex flex-col items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
