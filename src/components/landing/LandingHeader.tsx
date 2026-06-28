import Link from "next/link";
import { AppLogo } from "@/components/ui/AppLogo";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <AppLogo href="/" iconSize={36} showTagline={false} />
        <nav className="hidden items-center gap-5 text-sm md:flex">
          <Link href="/features" className="text-muted-foreground hover:text-primary">
            Features
          </Link>
          <Link href="/pickleball-scoring-app" className="text-muted-foreground hover:text-primary">
            Scoring
          </Link>
          <Link href="/download" className="text-muted-foreground hover:text-primary">
            Download
          </Link>
        </nav>
        <Link href="/auth" className="btn-outline px-5 py-2 text-sm">
          Sign In
        </Link>
      </div>
    </header>
  );
}
