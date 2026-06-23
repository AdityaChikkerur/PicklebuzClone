"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLogo } from "@/components/ui/AppLogo";
import { useLandingPage } from "@/hooks/useLandingPage";
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
        router.replace("/dashboard");
        return;
      }

      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;

        if (data.session?.user) {
          router.replace("/dashboard");
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
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">
        <section className="flex flex-col items-center gap-6 text-center">
          <AppLogo href={undefined} iconSize={64} />
          <div className="max-w-lg space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Score. Compete. Improve.
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              Live scoring, tournaments, club bookings, and player rankings —
              built for India&apos;s pickleball community.
            </p>
          </div>
          <div className="flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link href="/auth" className="btn-primary text-center">
              Get Started
            </Link>
            <Link href="/discover" className="btn-outline text-center">
              Find Players
            </Link>
          </div>
        </section>

        <LiveNowStrip matches={liveMatches} />
        <SponsorBannerSlot variant="compact" />
        <FeaturedTournamentsGrid tournaments={featuredTournaments} />
        <ExploreSection />
      </main>

      <LandingFooter />
    </div>
  );
}
