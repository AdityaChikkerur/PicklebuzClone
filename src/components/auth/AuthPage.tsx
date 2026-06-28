"use client";

import { Suspense, useState } from "react";
import { AppLogo } from "@/components/ui/AppLogo";
import { AuthBrandPanel } from "./AuthBrandPanel";
import { AuthTabs, type AuthTab } from "./AuthTabs";
import { GoogleSSOButton } from "./GoogleSSOButton";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

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

export function AuthPage() {
  const [tab, setTab] = useState<AuthTab>("login");

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
              <AuthTabs active={tab} onChange={setTab} />

              <div className="mt-6">
                <Suspense fallback={<AuthFormFallback />}>
                  <GoogleSSOButton />
                </Suspense>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                  <span className="bg-card/80 px-3 font-semibold text-muted-foreground backdrop-blur-sm">
                    or continue with email
                  </span>
                </div>
              </div>

              <div key={tab} className="fade-in">
                <Suspense fallback={<AuthFormFallback />}>
                  {tab === "login" ? <LoginForm /> : <SignupForm />}
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
