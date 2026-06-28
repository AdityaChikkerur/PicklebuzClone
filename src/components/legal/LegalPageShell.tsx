"use client";

import Link from "next/link";
import { AppLogo } from "@/components/ui/AppLogo";
import type { LegalDocument } from "./types";

interface LegalPageShellProps {
  document: LegalDocument;
  alternateLink?: { href: string; label: string };
}

export function LegalPageShell({ document, alternateLink }: LegalPageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <AppLogo href="/" iconSize={36} />
          <Link href="/auth" className="text-sm font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 border-b border-border pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Legal
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-foreground sm:text-3xl">
            {document.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {document.subtitle}
          </p>
          <p className="mt-3 text-xs text-muted-foreground/80">
            Last updated: {document.lastUpdated}
          </p>
        </div>

        <nav
          aria-label="Table of contents"
          className="card-base mb-10 p-5"
        >
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Contents
          </h2>
          <ol className="mt-3 space-y-2 text-sm">
            {document.sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-foreground/90 transition-colors hover:text-primary"
                >
                  {index + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="legal-prose space-y-10">
          {document.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {section.content}
              </div>
            </section>
          ))}
        </article>

        {alternateLink && (
          <div className="card-base mt-10 border-primary/20 bg-primary/5 p-5">
            <p className="text-sm text-muted-foreground">
              See also:{" "}
              <Link
                href={alternateLink.href}
                className="font-semibold text-primary hover:underline"
              >
                {alternateLink.label}
              </Link>
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-border py-6 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to home
        </Link>
      </footer>
    </div>
  );
}
