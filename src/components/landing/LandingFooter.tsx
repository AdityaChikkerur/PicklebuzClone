import Link from "next/link";
import { AppLogo } from "@/components/ui/AppLogo";

const FOOTER_LINKS = {
  product: [
    { href: "/features", label: "Features" },
    { href: "/pickleball-scoring-app", label: "Scoring app" },
    { href: "/live-pickleball-scores", label: "Live scores" },
    { href: "/pickleball-tournament-management", label: "Tournaments" },
    { href: "/pickleball-rankings", label: "Rankings" },
    { href: "/download", label: "Download" },
  ],
  discover: [
    { href: "/clubs", label: "Clubs" },
    { href: "/pickleball-clubs-india", label: "Clubs in India" },
    { href: "/pickleball-in-mumbai", label: "Mumbai" },
    { href: "/pickleball-in-bengaluru", label: "Bengaluru" },
    { href: "/pickleball-in-delhi-ncr", label: "Delhi NCR" },
    { href: "/rules", label: "Basic rules" },
  ],
  company: [
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/auth", label: "Sign in" },
  ],
} as const;

export function LandingFooter() {
  return (
    <footer className="relative border-t border-border glass">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
          <AppLogo href="/" iconSize={32} showTagline />

          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Product
              </h2>
              <nav className="mt-3 flex flex-col gap-2 text-sm">
                {FOOTER_LINKS.product.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Discover
              </h2>
              <nav className="mt-3 flex flex-col gap-2 text-sm">
                {FOOTER_LINKS.discover.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Company
              </h2>
              <nav className="mt-3 flex flex-col gap-2 text-sm">
                {FOOTER_LINKS.company.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="space-y-1 border-t border-border pt-6">
          <p className="tagline text-muted-foreground/70">
            © {new Date().getFullYear()} PickleBuzz · India&apos;s pickleball scoring network
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/55">
            By Praesidio Care Private Limited · picklebuzz.in
          </p>
        </div>
      </div>
    </footer>
  );
}
