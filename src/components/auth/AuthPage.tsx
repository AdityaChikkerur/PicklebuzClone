"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppLogo } from "@/components/ui/AppLogo";
import {
  formatSupabaseConnectionError,
  isLegacyApiKeyDisabledError,
} from "@/lib/auth/supabaseErrors";
import { AuthBrandPanel } from "./AuthBrandPanel";
import { GoogleSSOButton } from "./GoogleSSOButton";

function AuthFormFallback() {
  return (
    <div className="flex justify-center py-12" role="status" aria-label="Loading">
      <div className="relative">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <div className="absolute inset-0 rounded-full glow-neon-sm opacity-40" />
      </div>
    </div>
  );
}

function AuthErrorBanner() {
  const searchParams = useSearchParams();
  const rawError = searchParams.get("error");

  if (!rawError) return null;

  const message = formatSupabaseConnectionError(decodeURIComponent(rawError));
  const isKeyIssue = isLegacyApiKeyDisabledError(decodeURIComponent(rawError));

  return (
    <div
      role="alert"
      className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      <p className="font-semibold">Sign-in failed</p>
      <p className="mt-1">{message}</p>
      {isKeyIssue ? (
        <p className="mt-2 text-xs text-destructive/90">
          Update <code className="rounded bg-destructive/10 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in
          Vercel to your <code className="rounded bg-destructive/10 px-1">sb_publishable_...</code> key, then
          redeploy.
        </p>
      ) : null}
    </div>
  );
}

export function AuthPage() {
  return (
    <div className="relative flex min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <AuthBrandPanel />

      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-10 lg:px-8">
        <div className="w-full max-w-[420px] scale-in">
          <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
            <AppLogo href="/" iconSize={52} showTagline variant="hero" />
          </div>

          <div className="card-glow p-6 sm:p-8">
            <div className="relative z-10">
              <div className="mb-6 text-center">
                <h1 className="font-display text-2xl font-black italic tracking-tight text-foreground">
                  Sign in to PickleBuzz
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Use your Google account to get started.
                </p>
              </div>

              <Suspense fallback={<AuthFormFallback />}>
                <AuthErrorBanner />
                <GoogleSSOButton />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
