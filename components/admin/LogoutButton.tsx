// components/admin/LogoutButton.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/");
      router.refresh();
    }
  }

  return (
    <button type="button" onClick={logout} disabled={busy} className="btn btn-outline btn-sm">
      <LogOut size={14} aria-hidden />
      {busy ? "Signing out" : "Logout"}
    </button>
  );
}
