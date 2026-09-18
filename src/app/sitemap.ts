import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/utils";

/**
 * Served at /sitemap.xml. Routes come from `siteConfig.navigation`, so adding
 * a navbar tab adds it to the sitemap automatically.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return siteConfig.navigation.map((item) => ({
    url: absoluteUrl(item.href, siteConfig.url),
    lastModified,
    changeFrequency: item.href === "/" ? "weekly" : "monthly",
    priority: item.href === "/" ? 1 : 0.7,
  }));
}
