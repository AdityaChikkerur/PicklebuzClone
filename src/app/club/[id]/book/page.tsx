import type { Metadata } from "next";
import { BookingPage } from "@/components/clubs";

export const metadata: Metadata = {
  title: "Book Court",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <BookingPage clubId={id} />;
}
