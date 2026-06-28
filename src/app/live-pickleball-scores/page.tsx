import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { KeywordLandingPage } from "@/components/marketing";
import { buildPageMetadata, breadcrumbJsonLd, softwareApplicationJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Live Pickleball Scores — Real-Time Scoreboards & Spectator Links",
  description:
    "Follow live pickleball scores in real time with PickleBuzz. Share spectator links, watch rally-by-rally updates, and never miss a tournament final again.",
  path: "/live-pickleball-scores",
  keywords: [
    "live pickleball scores",
    "pickleball live score",
    "pickleball scoreboard online",
    "watch pickleball live",
  ],
});

export default function LivePickleballScoresPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Live Pickleball Scores", path: "/live-pickleball-scores" },
          ]),
        ]}
      />
      <KeywordLandingPage
        eyebrow="Live scores"
        title="Live pickleball scores — point by point, anywhere"
        subtitle="Every scored match on PickleBuzz can broadcast a live spectator board. Share a link and anyone can follow the action without an account."
        sections={[
          {
            heading: "Real-time updates without refresh",
            body: "Scores update instantly as the scorer taps points. Spectators see game score, serve side, timeouts, and match status on any phone or desktop browser.",
          },
          {
            heading: "Featured on the home page",
            body: "Live matches surface on the PickleBuzz homepage so the community discovers games happening right now — building the pickleball network city by city.",
          },
          {
            heading: "From casual games to tournament finals",
            body: "Whether it's a ladder night or a club championship final, live scoring makes every match feel like a pro event.",
          },
        ]}
        relatedLinks={[
          { href: "/pickleball-scoring-app", label: "Start scoring" },
          { href: "/", label: "See live matches" },
          { href: "/pickleball-tournament-management", label: "Tournament tools" },
        ]}
      />
    </>
  );
}
