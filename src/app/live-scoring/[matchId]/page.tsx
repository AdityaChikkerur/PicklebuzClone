import type { Metadata } from "next";
import { LiveScoringSession } from "@/components/scoring";

export const metadata: Metadata = {
  title: "Score Match",
};

interface PageProps {
  params: Promise<{ matchId: string }>;
}

export default async function LiveScoringMatchPage({ params }: PageProps) {
  const { matchId } = await params;
  return <LiveScoringSession matchId={matchId} />;
}
