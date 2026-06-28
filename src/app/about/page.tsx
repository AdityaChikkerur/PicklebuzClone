import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { InternalLinks, MarketingPageShell } from "@/components/marketing";
import {
  buildPageMetadata,
  breadcrumbJsonLd,
  organizationJsonLd,
  COMPANY_NAME,
  SUPPORT_EMAIL,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About PickleBuzz — India's Pickleball Network",
  description:
    "PickleBuzz by Praesidio Care Private Limited is building India's pickleball scoring network — live scores, tournaments, clubs, and rankings for every player.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
        ]}
      />
      <MarketingPageShell
        eyebrow="About"
        title="Your pickleball matters — we're here to score it"
        subtitle="PickleBuzz is India's mobile-first pickleball platform, inspired by how grassroots sports apps transformed cricket and adapted for the fastest-growing racket sport in the country."
      >
        <div className="prose-marketing space-y-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <section>
            <h2 className="text-xl font-bold text-foreground">Our mission</h2>
            <p className="mt-3">
              Just as CricHeroes became the go-to network for gully cricket, PickleBuzz aims to
              be India&apos;s definitive pickleball app — connecting players, clubs, and
              organizers with live scoring, verified stats, and tournament infrastructure.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">Who we serve</h2>
            <ul className="mt-3 list-inside list-disc space-y-2">
              <li>Recreational players tracking improvement and DUPR ratings</li>
              <li>Competitive athletes joining ranked tournaments nationwide</li>
              <li>Club owners managing courts and member bookings</li>
              <li>Organizers running brackets, fixtures, and fee collection</li>
              <li>Referees and admins keeping matches fair and verified</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">Company</h2>
            <p className="mt-3">
              PickleBuzz is operated by <strong className="text-foreground">{COMPANY_NAME}</strong>.
              For support, reach us at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>

        <InternalLinks
          links={[
            { href: "/features", label: "Features", description: "Full product overview" },
            { href: "/faq", label: "FAQ", description: "Common questions answered" },
            { href: "/contact", label: "Contact", description: "Get in touch with our team" },
          ]}
        />
      </MarketingPageShell>
    </>
  );
}
