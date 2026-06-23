import type { Metadata } from "next";
import { AuthPage } from "@/components/auth";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function AuthRoutePage() {
  return <AuthPage />;
}
