// app/admin/(panel)/dentists/page.tsx

import type { Metadata } from "next";
import DentistsManager from "@/components/admin/DentistsManager";

export const metadata: Metadata = { title: "Dentists" };

export default function DentistsPage() {
  return <DentistsManager />;
}
