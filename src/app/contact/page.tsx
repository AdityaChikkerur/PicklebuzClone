import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { InternalLinks, MarketingPageShell } from "@/components/marketing";
import {
  buildPageMetadata,
  breadcrumbJsonLd,
  organizationJsonLd,
  SUPPORT_EMAIL,
  PRIVACY_EMAIL,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact PickleBuzz — Support & Partnerships",
  description:
    "Contact PickleBuzz for player support, club onboarding, tournament partnerships, and media inquiries. Email support@picklebuzz.in.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        ]}
      />
      <MarketingPageShell
        eyebrow="Contact"
        title="Get in touch with the PickleBuzz team"
        subtitle="Whether you're a player, club owner, tournament organizer, or brand partner — we'd love to hear from you."
        ctaHref={`mailto:${SUPPORT_EMAIL}`}
        ctaLabel="Email Support"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="card-base p-6">
            <h2 className="text-lg font-bold text-foreground">Player support</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Account help, scoring questions, and bug reports.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
          </article>
          <article className="card-base p-6">
            <h2 className="text-lg font-bold text-foreground">Privacy & data</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              DPDP Act requests and data protection inquiries.
            </p>
            <a
              href={`mailto:${PRIVACY_EMAIL}`}
              className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
            >
              {PRIVACY_EMAIL}
            </a>
          </article>
          <article className="card-base p-6">
            <h2 className="text-lg font-bold text-foreground">Clubs & organizers</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Onboard your club, run sanctioned events, or explore sponsorship.
            </p>
            <Link
              href="/auth"
              className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Create an organizer account →
            </Link>
          </article>
          <article className="card-base p-6">
            <h2 className="text-lg font-bold text-foreground">Website</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Official PickleBuzz web app and Android download.
            </p>
            <Link
              href="/download"
              className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Download PickleBuzz →
            </Link>
          </article>
        </div>

        <InternalLinks
          links={[
            { href: "/about", label: "About us" },
            { href: "/faq", label: "FAQ" },
            { href: "/privacy", label: "Privacy policy" },
          ]}
        />
      </MarketingPageShell>
    </>
  );
}
