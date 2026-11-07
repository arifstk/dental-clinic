// app/layout.tsx

import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/seo";
import { OG_IMAGE, SITE_DESCRIPTION } from "@/lib/site";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GAPageTracker from "@/components/GAPageTracker";
import CookieConsentBanner from "@/components/CookieConsentBanner";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const description = SITE_DESCRIPTION;
  const defaultTitle = `${s.name} | Dental Clinic`;

  return {
    metadataBase: new URL(siteUrl),
    title: { default: defaultTitle, template: `%s | ${s.name}` },
    description,
    applicationName: s.name,
    authors: [{ name: s.name }],
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: s.name,
      locale: "en_US",
      url: "/",
      title: defaultTitle,
      description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${s.name} dental clinic` }],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description,
      images: [OG_IMAGE],
    },
    verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>
        {children}
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <GAPageTracker />
        </Suspense>
        <Suspense fallback={null}>
          <CookieConsentBanner />
        </Suspense>
      </body>
    </html>
  );
}
