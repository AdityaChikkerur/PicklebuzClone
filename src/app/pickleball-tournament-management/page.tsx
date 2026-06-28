import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { KeywordLandingPage } from "@/components/marketing";
import { buildPageMetadata, breadcrumbJsonLd, softwareApplicationJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Pickleball Tournament Management App — Brackets, Fixtures & Fees",
  description:
    "Run pickleball tournaments in India with PickleBuzz: registration, Razorpay payments, brackets, fixtures, live standings, and referee assignment.",
  path: "/pickleball-tournament-management",
  keywords: [
    "pickleball tournament app",
    "pickleball tournament management",
    "pickleball league software India",
    "pickleball bracket app",
  ],
});

export default function PickleballTournamentManagementPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Tournament Management", path: "/pickleball-tournament-management" },
          ]),
        ]}
      />
      <KeywordLandingPage
        eyebrow="Tournament management"
        title="Run pickleball tournaments like a pro — from registration to finals"
        subtitle="Create events, collect entry fees, generate fixtures, assign referees, and publish live standings — all from one organizer dashboard."
        sections={[
          {
            heading: "Registration and payments built in",
            body: "Open registration, set capacity and fees, and collect payments via Razorpay. Players sign up from their phones; you get a clean entrant list instantly.",
          },
          {
            heading: "Fixtures, brackets, and points tables",
            body: "Round-robin groups, knockout brackets, and automated points tables update as matches are scored. No more manual Excel brackets.",
          },
          {
            heading: "Referee and dispute workflows",
            body: "Assign referees, flag suspicious scores, and resolve disputes through admin tools designed for fair competitive play.",
          },
        ]}
        relatedLinks={[
          { href: "/pickleball-scoring-app", label: "Live scoring app" },
          { href: "/features", label: "All features" },
          { href: "/contact", label: "Partner with us" },
        ]}
      />
    </>
  );
}
