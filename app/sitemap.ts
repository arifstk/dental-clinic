// app/sitemap.ts

import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

type Entry = {
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly";
};

const pages: Entry[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/booking", priority: 0.9, changeFrequency: "monthly" },
  { path: "/services", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((p) => ({
    url: `${siteUrl}${p.path}`,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
