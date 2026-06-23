import type { Metadata } from "next";
import { AdminDashboardPage } from "@/components/admin";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default function AdminRoutePage() {
  return <AdminDashboardPage />;
}
