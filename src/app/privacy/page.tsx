import type { Metadata } from "next";
import { PrivacyPolicyPage } from "@/components/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How PickleBuzz collects, uses, and protects your personal data in accordance with the Digital Personal Data Protection Act, 2023 (India).",
};

export default function PrivacyRoutePage() {
  return <PrivacyPolicyPage />;
}
