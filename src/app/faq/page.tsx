import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqList, InternalLinks, MarketingPageShell } from "@/components/marketing";
import { buildPageMetadata, breadcrumbJsonLd, faqPageJsonLd } from "@/lib/seo";
import { FAQ_ITEMS } from "@/lib/seo/content";

export const metadata: Metadata = buildPageMetadata({
  title: "FAQ — Pickleball Scoring, Tournaments & Rankings",
  description:
    "Answers to common PickleBuzz questions: free scoring, BUZZ ratings, tournaments, club bookings, cities covered, and how we compare to cricket scoring apps.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={[
          faqPageJsonLd(FAQ_ITEMS),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
        ]}
      />
      <MarketingPageShell
        eyebrow="FAQ"
        title="Frequently asked questions"
        subtitle="Everything you need to know about scoring pickleball matches, joining tournaments, and growing your game with PickleBuzz."
        ctaLabel="Start Scoring Free"
      >
        <FaqList items={FAQ_ITEMS} />

        <InternalLinks
          links={[
            {
              href: "/pickleball-scoring-app",
              label: "Pickleball scoring app",
            },
            {
              href: "/download",
              label: "Download the app",
            },
            {
              href: "/contact",
              label: "Contact support",
            },
          ]}
        />
      </MarketingPageShell>
    </>
  );
}
