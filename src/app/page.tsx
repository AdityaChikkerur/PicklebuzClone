import type { Metadata } from "next";
import { LandingPage } from "@/components/landing";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildPageMetadata,
  faqPageJsonLd,
  softwareApplicationJsonLd,
} from "@/lib/seo";
import { FAQ_ITEMS } from "@/lib/seo/content";

export const metadata: Metadata = buildPageMetadata({
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={[softwareApplicationJsonLd(), faqPageJsonLd(FAQ_ITEMS.slice(0, 4))]} />
      <LandingPage />
    </>
  );
}
