import Link from "next/link";
import {
  MarketingPageShell,
  FeatureGrid,
  InternalLinks,
} from "@/components/marketing";
import { CORE_FEATURES } from "@/lib/seo/content";
import type { CityPageContent } from "@/lib/seo/content";

interface CityLandingPageProps {
  city: CityPageContent;
}

export function CityLandingPage({ city }: CityLandingPageProps) {
  return (
    <MarketingPageShell
      eyebrow={`Pickleball in ${city.city}`}
      title={city.headline}
      subtitle={city.intro}
      ctaLabel={`Join PickleBuzz in ${city.city}`}
    >
      <section>
        <h2 className="text-xl font-bold text-foreground">
          Why {city.city} players choose PickleBuzz
        </h2>
        <ul className="mt-6 space-y-3">
          {city.highlights.map((item) => (
            <li key={item} className="card-base flex gap-3 p-4 text-sm text-muted-foreground">
              <span className="text-primary" aria-hidden="true">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold text-foreground">Everything you need on court</h2>
        <div className="mt-6">
          <FeatureGrid features={CORE_FEATURES.slice(0, 3)} />
        </div>
      </section>

      <InternalLinks
        title="More pickleball resources"
        links={[
          {
            href: "/pickleball-scoring-app",
            label: "Pickleball scoring app",
            description: "Live score matches from your phone",
          },
          {
            href: "/clubs",
            label: "Find clubs",
            description: `Discover pickleball clubs near ${city.city}`,
          },
          {
            href: "/pickleball-tournament-management",
            label: "Run tournaments",
            description: "Brackets, fixtures, and live standings",
          },
        ]}
      />

      <p className="mt-10 text-sm text-muted-foreground">
        Ready to play?{" "}
        <Link href="/auth" className="font-semibold text-primary hover:underline">
          Create your free PickleBuzz account
        </Link>{" "}
        and start scoring in {city.city} today.
      </p>
    </MarketingPageShell>
  );
}

interface KeywordLandingPageProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  sections: { heading: string; body: string }[];
  relatedLinks: { href: string; label: string; description?: string }[];
}

export function KeywordLandingPage({
  eyebrow,
  title,
  subtitle,
  sections,
  relatedLinks,
}: KeywordLandingPageProps) {
  return (
    <MarketingPageShell eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-bold text-foreground">{section.heading}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <section className="mt-14">
        <h2 className="text-xl font-bold text-foreground">Built for Indian pickleball</h2>
        <div className="mt-6">
          <FeatureGrid features={CORE_FEATURES} />
        </div>
      </section>

      <InternalLinks links={relatedLinks} />
    </MarketingPageShell>
  );
}
