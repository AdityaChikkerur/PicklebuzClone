"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLogo } from "@/components/ui/AppLogo";
import { useLandingPage } from "@/hooks/useLandingPage";
import { getDefaultHomeForRole } from "@/lib/auth/routeGuards";
import { createClient } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { ExploreSection } from "./ExploreSection";
import { FeaturedTournamentsGrid } from "./FeaturedTournamentsGrid";
import { LandingFooter } from "./LandingFooter";
import { LandingHeader } from "./LandingHeader";
import { SponsorBannerSlot } from "@/components/monetization";
import { LiveNowStrip } from "./LiveNowStrip";

export function LandingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const { liveMatches, featuredTournaments } = useLandingPage();

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      const storeUser = useAuthStore.getState().user;
      const storeProfile = useAuthStore.getState().profile;

      if (storeUser || storeProfile) {
        router.replace(getDefaultHomeForRole(storeProfile?.role));
        return;
      }

      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;

        if (data.session?.user) {
          const profile = useAuthStore.getState().profile;
          router.replace(getDefaultHomeForRole(profile?.role));
          return;
        }
      } catch {
        // Mock mode — show the public landing page
      }

      if (!cancelled) setReady(true);
    }

    void checkAuth();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="relative">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent"
            role="status"
            aria-label="Loading"
          />
          <div className="absolute inset-0 rounded-full glow-neon-sm opacity-50" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Ambient background effects */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute left-1/2 top-0 h-px w-full max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <LandingHeader />

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-12 sm:px-6 sm:py-16">
        <section className="hero-glow flex flex-col items-center gap-8 text-center">
          <div className="scale-in relative z-10">
            <AppLogo href={undefined} iconSize={72} showTagline variant="hero" />
          </div>

          <div className="fade-in stagger-1 relative z-10 max-w-xl space-y-4">
            <h1 className="font-display text-4xl font-black italic leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Play. <span className="text-gradient-neon">Connect.</span> Compete.
            </h1>
            <p className="text-base leading-relaxed text-foreground/80 sm:text-lg">
              Live scoring, tournaments, club bookings, and player rankings,
              built for India&apos;s pickleball community.
            </p>
          </div>

          <div className="fade-in stagger-2 relative z-10 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link href="/auth" className="btn-primary text-center sm:min-w-[160px]">
              Get Started
            </Link>
            <Link href="/discover" className="btn-outline text-center sm:min-w-[160px]">
              Find Players
            </Link>
          </div>
        </section>

        <div className="fade-in stagger-3 space-y-12">
          <LiveNowStrip matches={liveMatches} />
          <SponsorBannerSlot variant="compact" />
          <FeaturedTournamentsGrid tournaments={featuredTournaments} />
          <ExploreSection />
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
