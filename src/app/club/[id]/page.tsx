import { ClubDetailPage } from "@/components/clubs";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ClubDetailPage clubId={id} />;
}
