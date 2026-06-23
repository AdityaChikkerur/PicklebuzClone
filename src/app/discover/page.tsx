import type { Metadata } from "next";
import { DiscoverPage } from "@/components/discover";

export const metadata: Metadata = {
  title: "Discover Players",
};

export default function DiscoverRoutePage() {
  return <DiscoverPage />;
}
