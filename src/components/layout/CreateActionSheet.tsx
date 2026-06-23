"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  SignalIcon,
  TrophyIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

const CREATE_ACTIONS = [
  {
    href: "/match-setup",
    label: "Create match",
    description: "Set up teams & scoring",
    icon: PlusCircleIcon,
    color: "bg-primary/10 text-primary",
  },
  {
    href: "/live-scoring",
    label: "Live score",
    description: "Open the scoreboard",
    icon: SignalIcon,
    color: "bg-danger/10 text-danger",
  },
  {
    href: "/discover",
    label: "Find partner",
    description: "Discover players nearby",
    icon: UserGroupIcon,
    color: "bg-secondary/10 text-secondary",
  },
  {
    href: "/create-tournament",
    label: "Create tournament",
    description: "Organize an event",
    icon: TrophyIcon,
    color: "bg-warning/10 text-warning",
  },
] as const;

interface CreateActionSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CreateActionSheet({ open, onClose }: CreateActionSheetProps) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-label="Close create menu"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-sheet-title"
        className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="create-sheet-title" className="text-lg font-bold text-foreground">
            Create
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <ul className="grid gap-2">
          {CREATE_ACTIONS.map((action) => (
            <li key={action.href}>
              <Link
                href={action.href}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary/30 hover:bg-muted/50"
              >
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    action.color
                  )}
                >
                  <action.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold text-foreground">
                    {action.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {action.description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
