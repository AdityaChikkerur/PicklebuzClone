import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { AuthHydration } from "@/components/auth/AuthHydration";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import "@/styles/globals.css";
import { APP_NAME } from "@/lib/utils";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Score. Compete. Improve. Pickleball match scoring, tournaments, and rankings for players and clubs.",
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable} suppressHydrationWarning>
      <body className={`${plusJakarta.className} min-h-screen font-sans antialiased`}>
        <AuthHydration />
        <ServiceWorkerRegister />
        {children}
        <Toaster
          position="bottom-center"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: "var(--font-plus-jakarta)",
              borderRadius: "12px",
              fontSize: "14px",
            },
            classNames: {
              toast: "card-base",
            },
          }}
        />
      </body>
    </html>
  );
}
