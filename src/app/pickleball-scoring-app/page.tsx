import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { KeywordLandingPage } from "@/components/marketing";
import { buildPageMetadata, breadcrumbJsonLd, softwareApplicationJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Pickleball Scoring App India — Free Live Match Scoring",
  description:
    "PickleBuzz is India's best free pickleball scoring app. Score rally-by-rally, share live spectator links, track stats, and climb the BUZZ rankings — built for Indian courts.",
  path: "/pickleball-scoring-app",
  keywords: [
    "pickleball scoring app",
    "pickleball scoring app India",
    "free pickleball app",
    "live pickleball scoring",
    "pickleball scorekeeper app",
  ],
});

export default function PickleballScoringAppPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Pickleball Scoring App", path: "/pickleball-scoring-app" },
          ]),
        ]}
      />
      <KeywordLandingPage
        eyebrow="Pickleball scoring app"
        title="India's #1 free pickleball scoring app"
        subtitle="Score every rally courtside, broadcast live to spectators, and build a verified match history — the CricHeroes experience for pickleball."
        sections={[
          {
            heading: "Score matches ball-by-ball — point by point",
            body: "PickleBuzz handles side-out scoring, serve rotation, kitchen faults, timeouts, and game/match logic so you focus on playing, not spreadsheets. Share a spectate link and friends follow along live.",
          },
          {
            heading: "Verified stats that matter",
            body: "Every scored match feeds your player profile — win rate, streaks, head-to-head records, and strength-weighted BUZZ rankings.",
          },
          {
            heading: "Free for players, powerful for organizers",
            body: "Players score for free. Organizers layer on tournaments, registration, Razorpay payments, and referee tools when they're ready to go bigger.",
          },
        ]}
        relatedLinks={[
          { href: "/live-pickleball-scores", label: "Live pickleball scores" },
          { href: "/pickleball-tournament-management", label: "Tournament management" },
          { href: "/download", label: "Download PickleBuzz" },
        ]}
      />
    </>
  );
}
