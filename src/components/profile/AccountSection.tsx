"use client";

import {
  ArrowRightOnRectangleIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { useSignOut } from "@/hooks/useSignOut";
import { useAuthStore } from "@/store/authStore";

export function AccountSection() {
  const user = useAuthStore((s) => s.user);
  const { signOut, pending } = useSignOut();
  const email = user?.email;

  return (
    <section className="card-base overflow-hidden" aria-labelledby="account-section-title">
      <div className="border-b border-border bg-muted/30 px-4 py-2.5">
        <h3
          id="account-section-title"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Account
        </h3>
      </div>

      {email ? (
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
          <EnvelopeIcon className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="truncate text-sm font-medium text-foreground">{email}</p>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => void signOut()}
        disabled={pending}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-medium text-danger transition-colors hover:bg-danger/5 focus:outline-none focus-visible:bg-danger/5 disabled:opacity-50"
      >
        <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>{pending ? "Signing out…" : "Sign Out"}</span>
      </button>
    </section>
  );
}
