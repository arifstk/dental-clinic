// components/seo/JsonLd.tsx

import { getSiteSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/seo";
import { OG_IMAGE, SITE_DESCRIPTION, schemaHours, site } from "@/lib/site";

// Generic helper: render any schema.org object as JSON-LD
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

// Accepts (and ignores) any props, so it works however page.tsx calls it
export async function LocalBusinessJsonLd(_props: Record<string, unknown> = {}) {
  const s = await getSiteSettings();
  const base = siteUrl.replace(/\/$/, "");

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Dentist",
        name: s.name || site.name,
        url: base,
        description: SITE_DESCRIPTION,
        image: `${base}${OG_IMAGE}`,
        telephone: s.phone || site.phone,
        email: site.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: site.address,
          addressLocality: "Dhaka",
          addressCountry: "BD",
        },
        hasMap: site.mapsUrl,
        openingHoursSpecification: schemaHours,
      }}
    />
  );
}

export default LocalBusinessJsonLd;
