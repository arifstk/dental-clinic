// lib/settings.ts

import { cache } from "react";
import { connectDB } from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import { site } from "@/lib/site";

export type HourRow = { days: string; time: string; closed: boolean };

export type SiteSettingsData = {
  name: string;
  phone: string;
  phoneHref: string; // computed from phone
  email: string;
  address: string;
  mapsUrl: string; // raw value saved by admin (may be empty)
  mapsHref: string; // mapsUrl, or auto-generated from address
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

// React cache() => Hero + Footer in the same request share one DB query
export const getSiteSettings = cache(async (): Promise<SiteSettingsData> => {
  try {
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
  } catch (err) {
    console.error("getSiteSettings failed, using defaults:", err);
    return defaultSettings;
  }
});
