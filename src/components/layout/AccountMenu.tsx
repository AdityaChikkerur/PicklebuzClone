"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Avatar } from "@/components/ui";
import { useSignOut } from "@/hooks/useSignOut";
import { useAuthStore } from "@/store/authStore";
import { avatarUrl, cn } from "@/lib/utils";

interface AccountMenuProps {
  className?: string;
  /** Compact trigger for dense headers (dashboard). */
  variant?: "default" | "compact";
}

export function AccountMenu({ className, variant = "default" }: AccountMenuProps) {
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const { signOut, pending } = useSignOut();

  const displayName = profile?.fullName ?? "Account";
  const email = user?.email ?? "";
  const avatar = profile?.avatarUrl ?? avatarUrl(displayName.toLowerCase().replace(/\s+/g, "-"));

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, open]);

  const handleSignOut = () => {
    close();
    void signOut();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        disabled={pending}
        className={cn(
          "rounded-full transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          pending && "opacity-60"
        )}
        aria-label={`${displayName} account menu`}
      >
        <Avatar src={avatar} name={displayName} size="sm" ring />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className={cn(
            "absolute right-0 z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-border bg-card shadow-lg ring-1 ring-black/5 transition-all duration-150",
            variant === "compact" && "w-60"
          )}
        >
          <div className="border-b border-border px-4 py-3.5">
            <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
            {email ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{email}</p>
            ) : null}
          </div>

          <div className="p-1.5">
            <Link
              href="/profile"
              role="menuitem"
              onClick={close}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:bg-muted"
            >
              <UserCircleIcon className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="flex-1 text-left">Profile</span>
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </Link>

            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              disabled={pending}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10 focus:outline-none focus-visible:bg-danger/10 disabled:opacity-50"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{pending ? "Signing out…" : "Sign Out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
