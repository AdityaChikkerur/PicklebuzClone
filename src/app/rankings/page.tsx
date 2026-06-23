import type { Metadata } from "next";
import { RankingsPage } from "@/components/rankings";

export const metadata: Metadata = {
  title: "Rankings",
};

export default function RankingsRoutePage() {
  return <RankingsPage />;
}
