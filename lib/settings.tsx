// lib/settings.tsx

import { cacheLife, cacheTag } from "next/cache";
import { connectDB } from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import { site } from "@/lib/site";
import { TAGS, failOnBuild } from "@/lib/cache";

export type HourRow = { days: string; time: string; closed: boolean };

export type SiteSettingsData = {
  name: string;
  phone: string;
  phoneHref: string;
  email: string;
  address: string;
  mapsUrl: string;
  mapsHref: string;
  hours: HourRow[];
};

export const toTelHref = (phone: string) =>
  `tel:${phone.replace(/[^\d+]/g, "")}`;

export const toMapsUrl = (address: string) =>
  `https://maps.google.com/?q=${encodeURIComponent(address)}`;

export const toMapsEmbedUrl = (address: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

type Source = {
  name: string;
  phone: string;
  email: string;
  address: string;
  mapsUrl?: string;
  hours: { days: string; time?: string; closed?: boolean }[];
};

function build(src: Source): SiteSettingsData {
  return {
    name: src.name,
    phone: src.phone,
    phoneHref: toTelHref(src.phone),
    email: src.email,
    address: src.address,
    mapsUrl: src.mapsUrl ?? "",
    mapsHref: src.mapsUrl || toMapsUrl(src.address),
    hours: src.hours.map((h) => ({
      days: h.days,
      time: h.time ?? "",
      closed: h.closed ?? h.time?.trim().toLowerCase() === "closed",
    })),
  };
}

// Used until the admin saves settings for the first time (or if DB is unreachable)
export const defaultSettings: SiteSettingsData = build(site);

// Cached across requests. Admin settings route must call invalidate(TAGS.settings).
async function loadSettings(): Promise<SiteSettingsData> {
  "use cache";
  cacheTag(TAGS.settings);
  cacheLife("content");

  await connectDB();
  const doc = await SiteSettings.findOne({ key: "main" }).lean();
  if (!doc) return defaultSettings;

  return build({
    name: doc.name || defaultSettings.name,
    phone: doc.phone || defaultSettings.phone,
    email: doc.email || defaultSettings.email,
    address: doc.address || defaultSettings.address,
    mapsUrl: doc.mapsUrl || "",
    hours: doc.hours?.length ? doc.hours : defaultSettings.hours,
  });
}

export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    return await loadSettings();
  } catch (err) {
    failOnBuild(err);
    console.error("getSiteSettings failed, using defaults:", err);
    return defaultSettings;
  }
}
