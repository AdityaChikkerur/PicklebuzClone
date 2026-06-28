import Link from "next/link";
import { AppLogo } from "@/components/ui/AppLogo";

export function LandingFooter() {
  return (
    <footer className="relative border-t border-border glass">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <AppLogo href="/" iconSize={32} showTagline />
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link
              href="/rules"
              className="font-medium text-foreground transition-colors hover:text-primary"
            >
              Basic rules
            </Link>
            <Link
              href="/auth"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Sign in
            </Link>
            <Link
              href="/rankings"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Rankings
            </Link>
            <Link
              href="/clubs"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Clubs
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Terms of Service
            </Link>
          </nav>
        </div>

        <div className="space-y-1">
          <p className="tagline text-muted-foreground/70">
            © {new Date().getFullYear()} PickleBuzz · Play • Connect • Compete
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/55">
            By Praesidio Care Private Limited
          </p>
        </div>
      </div>
    </footer>
  );
}
