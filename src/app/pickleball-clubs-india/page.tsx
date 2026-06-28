import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { KeywordLandingPage } from "@/components/marketing";
import { buildPageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Pickleball Clubs in India — Find Courts & Book Slots",
  description:
    "Discover pickleball clubs across India on PickleBuzz. Browse courts, check availability, book slots, and connect with local players in your city.",
  path: "/pickleball-clubs-india",
  keywords: [
    "pickleball clubs India",
    "pickleball courts India",
    "book pickleball court",
    "pickleball club finder",
  ],
});

export default function PickleballClubsIndiaPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Pickleball Clubs India", path: "/pickleball-clubs-india" },
        ])}
      />
      <KeywordLandingPage
        eyebrow="Clubs & courts"
        title="Find pickleball clubs and courts across India"
        subtitle="Stop hunting through WhatsApp groups. PickleBuzz lists clubs, surfaces, and booking options so you can play more and organize less."
        sections={[
          {
            heading: "Club discovery by city",
            body: "Browse clubs in Mumbai, Bengaluru, Delhi NCR, Hyderabad, Pune, Chennai, and growing markets. Filter by location and jump straight to court booking.",
          },
          {
            heading: "Court booking for club owners",
            body: "Club owners manage availability, pricing, and member bookings from a dedicated dashboard — reducing no-shows and phone-tag.",
          },
          {
            heading: "Community at every club",
            body: "Follow players, see who's playing nearby, and join club-hosted tournaments without leaving the app.",
          },
        ]}
        relatedLinks={[
          { href: "/clubs", label: "Browse clubs now" },
          { href: "/pickleball-in-mumbai", label: "Pickleball in Mumbai" },
          { href: "/pickleball-in-bengaluru", label: "Pickleball in Bengaluru" },
        ]}
      />
    </>
  );
}
