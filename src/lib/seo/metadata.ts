import type { Metadata } from "next";
import { APP_NAME } from "@/lib/utils";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_TITLE,
  SITE_URL,
} from "./constants";

export interface PageSeoOptions {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  ogType?: "website" | "article";
}

export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function buildPageMetadata(options: PageSeoOptions = {}): Metadata {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    path = "/",
    keywords = DEFAULT_KEYWORDS,
    noIndex = false,
    ogType = "website",
  } = options;

  const url = absoluteUrl(path);
  const fullTitle = title ?? DEFAULT_TITLE;

  return {
    title: title ? title : { default: DEFAULT_TITLE, template: `%s | ${APP_NAME}` },
    description,
    keywords,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: ogType,
      locale: "en_IN",
      url,
      siteName: APP_NAME,
      title: fullTitle,
      description,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${APP_NAME} — India's pickleball scoring & tournament app`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ["/twitter-image"],
      creator: "@picklebuzz",
      site: "@picklebuzz",
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? {
          verification: {
            google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
          },
        }
      : {}),
  };
}
