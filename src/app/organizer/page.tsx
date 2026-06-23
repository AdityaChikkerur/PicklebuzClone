import type { Metadata } from "next";
import { OrganizerDashboardPage } from "@/components/organizer";

export const metadata: Metadata = {
  title: "Organizer Dashboard",
};

export default function OrganizerRoutePage() {
  return <OrganizerDashboardPage />;
}
