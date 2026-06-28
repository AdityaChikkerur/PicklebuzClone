import type { MetadataRoute } from "next";
import { MARKETING_ROUTES, SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.entries(MARKETING_ROUTES).map(([path, config]) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified: new Date(),
    changeFrequency: config.changeFrequency,
    priority: config.priority,
  }));
}
