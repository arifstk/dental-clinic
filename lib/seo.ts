// lib/seo.ts

import type { Metadata } from "next";
import type { SiteSettingsData } from "@/lib/settings";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

type PageMeta = {
  title: string;
  description: string;
  path: string; // e.g. "/services"
  absoluteTitle?: boolean; // skip the "%s | Name" template
};

// Pages that set their own openGraph replace the root one (shallow merge),
// so each page gets canonical + openGraph + twitter from here.
export function buildMetadata(siteName: string, p: PageMeta): Metadata {
  const fullTitle = p.absoluteTitle ? p.title : `${p.title} | ${siteName}`;
  return {
    title: p.absoluteTitle ? { absolute: p.title } : p.title,
    description: p.description,
    alternates: { canonical: p.path },
    openGraph: {
      type: "website",
      siteName,
      locale: "en_US",
      title: fullTitle,
      description: p.description,
      url: p.path,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: p.description,
    },
  };
}

/* ---------- JSON-LD (schema.org Dentist) ---------- */

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function dayIndex(s: string) {
  const k = s.trim().slice(0, 3).toLowerCase();
  return DAYS.findIndex((d) => d.slice(0, 3).toLowerCase() === k);
}

const RANGE = /\s*[-–—]\s*|\s+to\s+/i;

// "Saturday - Thursday" -> ["Saturday","Sunday",...,"Thursday"]
function expandDays(label: string): string[] {
  const out = new Set<string>();
  for (const group of label.split(/\s*[,&]\s*/)) {
    const [a, b] = group.split(RANGE);
    const i = dayIndex(a ?? "");
    if (i < 0) continue;
    if (!b) {
      out.add(DAYS[i]);
      continue;
    }
    const j = dayIndex(b);
    if (j < 0) continue;
    for (let k = i; ; k = (k + 1) % 7) {
      out.add(DAYS[k]);
      if (k === j) break;
    }
  }
  return [...out];
}

// "9:00 AM" -> "09:00"
function to24(t: string): string | null {
  const m = t.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2] ?? "00";
  const ap = m[3]?.toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}`;
}

function openingHours(hours: SiteSettingsData["hours"]) {
  const specs = hours.flatMap((h) => {
    if (h.closed) return [];
    const [open, close] = h.time.split(RANGE);
    const opens = to24(open ?? "");
    const closes = to24(close ?? "");
    const days = expandDays(h.days);
    if (!opens || !closes || days.length === 0) return [];
    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: days,
        opens,
        closes,
      },
    ];
  });
  return specs.length ? specs : undefined;
}

export function dentistSchema(s: SiteSettingsData) {
  return {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: s.name,
    url: siteUrl,
    image: `${siteUrl}/opengraph-image`,
    telephone: s.phone,
    email: s.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: s.address,
      addressCountry: "BD",
    },
    hasMap: s.mapsHref,
    openingHoursSpecification: openingHours(s.hours),
  };
}
