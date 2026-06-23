import type { Metadata } from "next";
import { AdminFlaggedPage } from "@/components/admin/AdminFlaggedPage";

export const metadata: Metadata = {
  title: "Flagged Scores",
};

export default function AdminFlaggedRoutePage() {
  return <AdminFlaggedPage />;
}
