import type { Metadata } from "next";
import { CreateTournamentPage } from "@/components/tournament";

export const metadata: Metadata = {
  title: "Create Tournament",
};

export default function CreateTournamentRoutePage() {
  return <CreateTournamentPage />;
}
