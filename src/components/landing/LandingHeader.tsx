import Link from "next/link";
import { AppLogo } from "@/components/ui/AppLogo";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <AppLogo href="/" iconSize={36} />
        <Link href="/auth" className="btn-outline px-4 py-2 text-sm">
          Sign In
        </Link>
      </div>
    </header>
  );
}
