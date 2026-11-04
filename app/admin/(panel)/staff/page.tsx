// app/admin/(panel)/staff/page.tsx

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import StaffManager from "@/components/admin/StaffManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Staff" };

export default async function StaffPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/dashboard");

  return <StaffManager currentId={session.sub} />;
}
