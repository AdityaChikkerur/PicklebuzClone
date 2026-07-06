import { APP_NAME } from "@/lib/utils";

export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "https://www.picklebuzz.in";

export const COMPANY_NAME = "Praesidio Care Private Limited";
export const SUPPORT_EMAIL = "support@picklebuzz.in";
export const PRIVACY_EMAIL = "privacy@picklebuzz.in";

export const DEFAULT_TITLE =
  "PickleBuzz — India's #1 Pickleball Scoring App | Live Scores & Tournaments";

export const DEFAULT_DESCRIPTION =
  "PickleBuzz is India's top free pickleball app for live match scoring, tournaments, club court bookings, player rankings, and BUZZ ratings. Built for players, clubs, and organizers.";

export const DEFAULT_KEYWORDS = [
  "pickleball app India",
  "pickleball scoring app",
  "live pickleball scores",
  "pickleball tournament app",
  "pickleball rankings India",
  "pickleball club booking",
  "BUZZ pickleball India",
  "pickleball match scoring",
  "pickleball league management",
  "PickleBuzz",
  APP_NAME.toLowerCase(),
];

export const SOCIAL_LINKS = {
  twitter: "https://twitter.com/picklebuzz",
  instagram: "https://instagram.com/picklebuzz",
  linkedin: "https://linkedin.com/company/picklebuzz",
} as const;

/** Public marketing routes indexed for SEO (path → priority). */
export const MARKETING_ROUTES: Record<string, { priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }> = {
  "/": { priority: 1, changeFrequency: "weekly" },
  "/features": { priority: 0.9, changeFrequency: "monthly" },
  "/about": { priority: 0.8, changeFrequency: "monthly" },
  "/faq": { priority: 0.8, changeFrequency: "monthly" },
  "/contact": { priority: 0.7, changeFrequency: "yearly" },
  "/download": { priority: 0.9, changeFrequency: "monthly" },
  "/pickleball-scoring-app": { priority: 0.95, changeFrequency: "monthly" },
  "/pickleball-tournament-management": { priority: 0.95, changeFrequency: "monthly" },
  "/pickleball-clubs-india": { priority: 0.9, changeFrequency: "monthly" },
  "/live-pickleball-scores": { priority: 0.95, changeFrequency: "weekly" },
  "/pickleball-rankings": { priority: 0.9, changeFrequency: "weekly" },
  "/pickleball-in-mumbai": { priority: 0.85, changeFrequency: "monthly" },
  "/pickleball-in-bengaluru": { priority: 0.85, changeFrequency: "monthly" },
  "/pickleball-in-delhi-ncr": { priority: 0.85, changeFrequency: "monthly" },
  "/pickleball-in-hyderabad": { priority: 0.85, changeFrequency: "monthly" },
  "/pickleball-in-pune": { priority: 0.85, changeFrequency: "monthly" },
  "/pickleball-in-chennai": { priority: 0.85, changeFrequency: "monthly" },
  "/clubs": { priority: 0.85, changeFrequency: "weekly" },
  "/rules": { priority: 0.75, changeFrequency: "yearly" },
  "/privacy": { priority: 0.3, changeFrequency: "yearly" },
  "/terms": { priority: 0.3, changeFrequency: "yearly" },
};

export const PUBLIC_MARKETING_PATHS = new Set(Object.keys(MARKETING_ROUTES));
