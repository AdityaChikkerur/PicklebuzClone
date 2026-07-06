import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { KeywordLandingPage } from "@/components/marketing";
import { buildPageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Pickleball Rankings India — Leaderboards, Stats & BUZZ",
  description:
    "Track pickleball rankings in India with PickleBuzz. Strength-weighted leaderboards, win streaks, head-to-head stats, and BUZZ ratings for competitive players.",
  path: "/pickleball-rankings",
  keywords: [
    "pickleball rankings India",
    "pickleball leaderboard",
    "pickleball player rankings",
    "BUZZ India pickleball",
  ],
});

export default function PickleballRankingsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Pickleball Rankings", path: "/pickleball-rankings" },
        ])}
      />
      <KeywordLandingPage
        eyebrow="Rankings"
        title="Pickleball rankings that reward who you beat"
        subtitle="Move beyond simple win counts. PickleBuzz rankings weigh opponent strength so your standing reflects real competitive progress."
        sections={[
          {
            heading: "Strength-weighted leaderboards",
            body: "Beat stronger opponents and climb faster. Our ranking engine considers match context, not just W/L records.",
          },
          {
            heading: "BUZZ rating",
            body: "Your PickleBuzz skill rating updates automatically from verified match results — India's own pickleball ranking system.",
          },
          {
            heading: "Stats that drive improvement",
            body: "Win percentage, streaks, head-to-head history, and tournament points — all in one player dashboard.",
          },
        ]}
        relatedLinks={[
          { href: "/auth", label: "Create account" },
          { href: "/pickleball-scoring-app", label: "Score matches" },
          { href: "/features", label: "See features" },
        ]}
      />
    </>
  );
}
