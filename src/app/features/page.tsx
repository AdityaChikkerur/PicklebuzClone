import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  FeatureGrid,
  InternalLinks,
  MarketingPageShell,
} from "@/components/marketing";
import { buildPageMetadata, breadcrumbJsonLd, softwareApplicationJsonLd } from "@/lib/seo";
import { CORE_FEATURES } from "@/lib/seo/content";

export const metadata: Metadata = buildPageMetadata({
  title: "Features — Live Scoring, Tournaments, Rankings & Clubs",
  description:
    "Explore PickleBuzz features: live pickleball scoring, spectator boards, tournament management, DUPR sync, club bookings, and India-wide player rankings.",
  path: "/features",
  keywords: [
    "pickleball app features",
    "pickleball tournament software",
    "pickleball live scoring features",
    "PickleBuzz features",
  ],
});

export default function FeaturesPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Features", path: "/features" },
          ]),
          softwareApplicationJsonLd(),
        ]}
      />
      <MarketingPageShell
        eyebrow="Features"
        title="Everything India's pickleball community needs — in one app"
        subtitle="From casual court sessions to national-style tournaments, PickleBuzz gives players, clubs, and organizers pro-grade tools on mobile and web."
      >
        <FeatureGrid features={CORE_FEATURES} />

        <InternalLinks
          links={[
            {
              href: "/pickleball-scoring-app",
              label: "Pickleball scoring app",
              description: "Score matches live from courtside",
            },
            {
              href: "/pickleball-tournament-management",
              label: "Tournament management",
              description: "Brackets, registration, and payments",
            },
            {
              href: "/download",
              label: "Download PickleBuzz",
              description: "Web app & Android APK",
            },
          ]}
        />
      </MarketingPageShell>
    </>
  );
}
