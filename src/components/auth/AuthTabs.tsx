"use client";

import { cn } from "@/lib/utils";

export type AuthTab = "login" | "signup";

interface AuthTabsProps {
  active: AuthTab;
  onChange: (tab: AuthTab) => void;
}

export function AuthTabs({ active, onChange }: AuthTabsProps) {
  return (
    <div
      className="flex rounded-xl bg-muted p-1"
      role="tablist"
      aria-label="Authentication mode"
    >
      {(
        [
          { id: "login" as const, label: "Log In" },
          { id: "signup" as const, label: "Sign Up" },
        ] as const
      ).map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active === tab.id
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
