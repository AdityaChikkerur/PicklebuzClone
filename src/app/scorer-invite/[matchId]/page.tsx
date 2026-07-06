import { ScorerInvitePage } from "@/components/scoring/ScorerInvitePage";

interface PageProps {
  params: Promise<{ matchId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { matchId } = await params;
  return <ScorerInvitePage matchId={matchId} />;
}
