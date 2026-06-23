import { SpectatePage } from "@/components/spectate/SpectatePage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <SpectatePage matchId={id} />;
}
