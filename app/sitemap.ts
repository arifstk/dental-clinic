// app/sitemap.ts

import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { navLinks } from "@/lib/site";

// No lastModified on purpose: new Date() here would trigger the cache-components "current time" error
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl.replace(/\/$/, "");
  const paths = [...navLinks.map((l) => l.href), "/booking"];

  return paths.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    changeFrequency: path === "/" || path === "/booking" ? "weekly" : "monthly",
    priority:
      path === "/"
        ? 1
        : path === "/booking"
          ? 0.9
          : path === "/services"
            ? 0.8
            : 0.6,
  }));
}
