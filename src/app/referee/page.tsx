import type { Metadata } from "next";
import { RefereeDashboardPage } from "@/components/referee/RefereeDashboardPage";

export const metadata: Metadata = {
  title: "Referee",
};

export default function RefereeRoutePage() {
  return <RefereeDashboardPage />;
}
