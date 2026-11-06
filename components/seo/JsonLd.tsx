// components/seo/JsonLd.tsx

import { getSiteSettings } from "@/lib/settings";
import { dentistSchema } from "@/lib/seo";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // "<" is escaped so content can never close the script tag
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export async function LocalBusinessJsonLd() {
  const s = await getSiteSettings();
  return <JsonLd data={dentistSchema(s)} />;
}
