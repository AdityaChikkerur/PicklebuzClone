import type { Metadata } from "next";
import { LiveMatchesPage } from "@/components/scoring";

export const metadata: Metadata = {
  title: "Live Matches",
};

export default function LiveScoringRoutePage() {
  return <LiveMatchesPage />;
}
