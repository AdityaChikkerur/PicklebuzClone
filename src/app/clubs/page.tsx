import type { Metadata } from "next";
import { ClubsPage } from "@/components/clubs";

export const metadata: Metadata = {
  title: "Clubs",
};

export default function ClubsRoutePage() {
  return <ClubsPage />;
}
