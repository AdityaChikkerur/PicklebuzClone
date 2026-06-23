import type { Metadata } from "next";
import { RulesPage } from "@/components/rules";

export const metadata: Metadata = {
  title: "Basic Rules",
  description:
    "Learn pickleball basics — two-bounce rule, kitchen, serves, faults, and scoring.",
};

export default function RulesRoutePage() {
  return <RulesPage />;
}
