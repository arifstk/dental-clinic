// app/sitemap.ts

import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { navLinks } from "@/lib/site";

// No lastModified on purpose: new Date() here would trigger the cache-components "current time" error
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl.replace(/\/$/, "");

  return navLinks.map((l) => ({
    url: `${base}${l.href === "/" ? "" : l.href}`,
    changeFrequency: l.href === "/" ? "weekly" : "monthly",
    priority: l.href === "/" ? 1 : l.href === "/services" ? 0.8 : 0.6,
  }));
}
