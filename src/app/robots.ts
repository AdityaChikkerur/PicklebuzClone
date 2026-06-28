import type { MetadataRoute } from "next";
import { MARKETING_ROUTES, SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/dashboard",
          "/profile",
          "/stats",
          "/discover",
          "/notifications",
          "/match-setup",
          "/live-scoring",
          "/match/",
          "/create-tournament",
          "/club-dashboard",
          "/organizer",
          "/referee",
          "/auth/callback",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
