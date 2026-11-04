// app/admin/(panel)/services/page.tsx

import type { Metadata } from "next";
import ServicesManager from "@/components/admin/ServicesManager";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return <ServicesManager />;
}
