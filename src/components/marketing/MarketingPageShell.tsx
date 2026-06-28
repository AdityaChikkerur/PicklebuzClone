import Link from "next/link";
import { AppLogo } from "@/components/ui/AppLogo";
import { LandingFooter } from "@/components/landing/LandingFooter";

interface MarketingPageShellProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  ctaHref?: string;
  ctaLabel?: string;
}

export function MarketingPageShell({
  eyebrow,
  title,
  subtitle,
  children,
  ctaHref = "/auth",
  ctaLabel = "Get Started Free",
}: MarketingPageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <AppLogo href="/" iconSize={36} showTagline={false} />
          <nav className="hidden items-center gap-5 text-sm sm:flex">
            <Link href="/features" className="text-muted-foreground hover:text-primary">
              Features
            </Link>
            <Link href="/faq" className="text-muted-foreground hover:text-primary">
              FAQ
            </Link>
            <Link href="/download" className="text-muted-foreground hover:text-primary">
              Download
            </Link>
          </nav>
          <Link href="/auth" className="btn-outline px-4 py-2 text-sm">
            Sign In
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="hero-glow mb-12 max-w-3xl">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-3 font-display text-3xl font-black italic leading-tight text-foreground sm:text-4xl md:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {subtitle}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={ctaHref} className="btn-primary px-6 py-3">
              {ctaLabel}
            </Link>
            <Link href="/features" className="btn-outline px-6 py-3">
              See All Features
            </Link>
          </div>
        </div>

        {children}
      </main>

      <LandingFooter />
    </div>
  );
}

interface FeatureGridProps {
  features: { title: string; description: string; icon: string }[];
}

export function FeatureGrid({ features }: FeatureGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <article key={feature.title} className="card-base p-6">
          <span className="text-2xl" aria-hidden="true">
            {feature.icon}
          </span>
          <h2 className="mt-3 text-lg font-bold text-foreground">{feature.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {feature.description}
          </p>
        </article>
      ))}
    </div>
  );
}

interface FaqListProps {
  items: { question: string; answer: string }[];
}

export function FaqList({ items }: FaqListProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <details key={item.question} className="card-base group p-5">
          <summary className="cursor-pointer list-none text-base font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-start justify-between gap-4">
              {item.question}
              <span className="text-primary transition-transform group-open:rotate-45">+</span>
            </span>
          </summary>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

interface InternalLinksProps {
  links: { href: string; label: string; description?: string }[];
  title?: string;
}

export function InternalLinks({
  links,
  title = "Explore PickleBuzz",
}: InternalLinksProps) {
  return (
    <section className="mt-14 border-t border-border pt-10">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="card-base block p-4 transition-colors hover:border-primary/40"
          >
            <span className="font-semibold text-foreground">{link.label}</span>
            {link.description && (
              <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
