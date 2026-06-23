import type { Metadata } from "next";
import { ClubDashboardPage } from "@/components/clubs";

export const metadata: Metadata = {
  title: "Club Dashboard",
};

export default function ClubDashboardRoutePage() {
  return <ClubDashboardPage />;
}
