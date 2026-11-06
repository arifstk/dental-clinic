// app/robots.ts
// /admin is intentionally NOT listed: robots.txt is public, and your proxy
// already hides the admin area (404 without the gate cookie).

import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/manage/"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
