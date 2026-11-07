// lib/gtag.ts

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
export const CONSENT_KEY = "clinic_cookie_consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function pageview(url: string) {
  if (!GA_ID || typeof window === "undefined") return;
  window.gtag?.("event", "page_view", {
    page_path: url,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function setConsent(granted: boolean) {
  try {
    localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
  } catch {}
  window.gtag?.("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
  });
}
