// app/admin/(panel)/settings/page.tsx

import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export const metadata: Metadata = { title: "Settings" };
// export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Site settings</h1>
        <p className="muted mt-1">
          Contact info and opening hours shown on the Hero section and Footer.
        </p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
