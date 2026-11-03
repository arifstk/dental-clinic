// app/manage/[token]/page.tsx

import type { Metadata } from "next";
import { Suspense } from "react";
import ManageClient from "./ManageClient";

export const metadata: Metadata = {
  title: "Manage appointment",
  robots: { index: false, follow: false },
};

export default function ManagePage() {
  return (
    <Suspense fallback={<main className="container-page py-16 text-center muted">Loading...</main>}>
      <ManageClient />
    </Suspense>
  );
}

