import type { Metadata } from "next";
import { TermsOfServicePage } from "@/components/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions governing your use of the PickleBuzz pickleball platform operated by Praesidio Care Private Limited.",
};

export default function TermsRoutePage() {
  return <TermsOfServicePage />;
}
