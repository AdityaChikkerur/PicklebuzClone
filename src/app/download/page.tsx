import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { InternalLinks, MarketingPageShell } from "@/components/marketing";
import {
  buildPageMetadata,
  breadcrumbJsonLd,
  softwareApplicationJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Download PickleBuzz — Free Pickleball App for Android & Web",
  description:
    "Download PickleBuzz free on Android or use the web app. Live pickleball scoring, tournaments, rankings, and club bookings — India's top pickleball app.",
  path: "/download",
  keywords: [
    "download PickleBuzz",
    "pickleball app download India",
    "PickleBuzz APK",
    "pickleball app Android",
  ],
});

export default function DownloadPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Download", path: "/download" },
          ]),
        ]}
      />
      <MarketingPageShell
        eyebrow="Download"
        title="Get PickleBuzz on your phone — free"
        subtitle="Install the PWA from your browser or use our Android app. Score matches courtside, follow live games, and join tournaments in minutes."
        ctaHref="/auth"
        ctaLabel="Open Web App"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="card-base p-6">
            <h2 className="text-lg font-bold text-foreground">Web app (PWA)</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Visit picklebuzz.in on Chrome or Safari, sign in, and tap &quot;Add to Home
              Screen&quot; for a native-like experience.
            </p>
            <Link href="/auth" className="btn-primary mt-4 inline-block px-5 py-2.5 text-sm">
              Launch Web App
            </Link>
          </article>
          <article className="card-base p-6">
            <h2 className="text-lg font-bold text-foreground">Android</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              PickleBuzz for Android wraps our production web app with offline-ready PWA
              support. Ideal for courtside scoring.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Google Play listing coming soon. Contact{" "}
              <a href="mailto:support@picklebuzz.in" className="text-primary hover:underline">
                support@picklebuzz.in
              </a>{" "}
              for early access APK.
            </p>
          </article>
        </div>

        <section className="mt-10 card-base border-primary/20 bg-primary/5 p-6">
          <h2 className="text-lg font-bold text-foreground">Why download PickleBuzz?</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>✓ Free live pickleball match scoring</li>
            <li>✓ Real-time spectator scoreboards</li>
            <li>✓ Tournament registration and brackets</li>
            <li>✓ India-wide club discovery and court booking</li>
            <li>✓ BUZZ rating and player rankings</li>
          </ul>
        </section>

        <InternalLinks
          links={[
            { href: "/pickleball-scoring-app", label: "Scoring app" },
            { href: "/features", label: "All features" },
            { href: "/faq", label: "FAQ" },
          ]}
        />
      </MarketingPageShell>
    </>
  );
}
