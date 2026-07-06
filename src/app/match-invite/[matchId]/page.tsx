import { MatchInvitePage } from "@/components/scoring/MatchInvitePage";

interface PageProps {
  params: Promise<{ matchId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { matchId } = await params;
  return <MatchInvitePage matchId={matchId} />;
}
