"use client";

import { LegalPageShell } from "./LegalPageShell";
import { PRIVACY_POLICY } from "./privacyContent";

export function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      document={PRIVACY_POLICY}
      alternateLink={{ href: "/terms", label: "Terms of Service" }}
    />
  );
}
