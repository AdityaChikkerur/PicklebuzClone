import type { Metadata } from "next";
import { NotificationsPage } from "@/components/notifications";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function NotificationsRoutePage() {
  return <NotificationsPage />;
}
