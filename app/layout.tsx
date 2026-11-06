// app/layout.tsx

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/seo";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const description = "Book your dental appointment online in under a minute.";

  return {
    metadataBase: new URL(siteUrl),
    title: { default: s.name, template: `%s | ${s.name}` },
    description,
    applicationName: s.name,
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: s.name,
      locale: "en_US",
      title: s.name,
      description,
    },
    twitter: { card: "summary_large_image", title: s.name, description },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
