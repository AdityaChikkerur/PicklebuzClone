import { PlayerProfilePage } from "@/components/player/PlayerProfilePage";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return <PlayerProfilePage playerId={id} />;
}