import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import { AuthHydration } from "@/components/auth/AuthHydration";
import { ProfileOnboardingGate } from "@/components/auth/ProfileOnboardingGate";
import { AccessDeniedToast } from "@/components/auth/AccessDeniedToast";
import { AppProviders } from "@/components/providers/AppProviders";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { CapacitorSplash } from "@/components/pwa/CapacitorSplash";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildPageMetadata,
  organizationJsonLd,
  webSiteJsonLd,
} from "@/lib/seo";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  ...buildPageMetadata(),
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: ["/icon.png"],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "PickleBuzz",
    statusBarStyle: "black-translucent",
  },
  category: "sports",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a0a0b" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={`dark ${inter.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <body className={`${inter.className} min-h-screen font-sans antialiased`}>
        <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
        <AuthHydration />
        <ProfileOnboardingGate />
        <AccessDeniedToast />
        <ServiceWorkerRegister />
        <CapacitorSplash />
        <AppProviders>{children}</AppProviders>
        <Toaster
          position="bottom-center"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: "var(--font-inter)",
              borderRadius: "14px",
              fontSize: "14px",
              background: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
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
