import type { Metadata } from "next";
import { AdminDisputesPage } from "@/components/admin";

export const metadata: Metadata = {
  title: "Dispute Resolution",
};

export default function AdminDisputesRoutePage() {
  return <AdminDisputesPage />;
}
