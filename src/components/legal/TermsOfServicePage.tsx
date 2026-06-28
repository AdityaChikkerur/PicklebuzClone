"use client";

import { LegalPageShell } from "./LegalPageShell";
import { TERMS_OF_SERVICE } from "./termsContent";

export function TermsOfServicePage() {
  return (
    <LegalPageShell
      document={TERMS_OF_SERVICE}
      alternateLink={{ href: "/privacy", label: "Privacy Policy" }}
    />
  );
}
