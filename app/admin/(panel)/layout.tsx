// app/admin/(panel)/layout.tsx

import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <AuthShell>{children}</AuthShell>
    </Suspense>
  );
}

async function AuthShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell name={session.name} role={session.role}>
      {children}
    </AdminShell>
  );
}

function PanelSkeleton() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-64 animate-pulse bg-surface md:block" />
      <div className="flex-1 p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-surface" />
        <div className="mt-6 h-64 animate-pulse rounded-card bg-surface" />
      </div>
    </div>
  );
}

