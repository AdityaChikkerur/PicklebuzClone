import type { Metadata } from "next";
import { MatchSetupPage } from "@/components/match";

export const metadata: Metadata = {
  title: "Create Match",
};

export default function MatchSetupRoutePage() {
  return <MatchSetupPage />;
}
