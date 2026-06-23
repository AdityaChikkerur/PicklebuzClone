import Link from "next/link";
import { AppLogo } from "@/components/ui/AppLogo";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <AppLogo href="/" iconSize={32} />
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link
              href="/rules"
              className="font-medium text-foreground hover:text-primary"
            >
              Basic rules
            </Link>
            <Link
              href="/auth"
              className="text-muted-foreground hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/rankings"
              className="text-muted-foreground hover:text-foreground"
            >
              Rankings
            </Link>
            <Link
              href="/clubs"
              className="text-muted-foreground hover:text-foreground"
            >
              Clubs
            </Link>
          </nav>
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} PickleBuzz. Score. Compete. Improve.
        </p>
      </div>
    </footer>
  );
}
