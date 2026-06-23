import type { Metadata } from "next";
import { LiveScoringPage } from "@/components/scoring";

export const metadata: Metadata = {
  title: "Live Scoring",
};

export default function LiveScoringRoutePage() {
  return <LiveScoringPage />;
}
