import type { Metadata } from "next";
import { AdminTournamentsPage } from "@/components/admin";

export const metadata: Metadata = {
  title: "Tournament Management",
};

export default function AdminTournamentsRoutePage() {
  return <AdminTournamentsPage />;
}
