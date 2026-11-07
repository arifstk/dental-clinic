// components/CookieConsentBanner.tsx

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Cookie } from "lucide-react";
import { CONSENT_KEY, setConsent } from "@/lib/gtag";

export default function CookieConsentBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible || pathname.startsWith("/admin")) return null;

  function choose(granted: boolean) {
    setConsent(granted);
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-24 z-50 mx-auto max-w-2xl rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-xl sm:p-5 md:bottom-3"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
          <Cookie size={22} aria-hidden />
        </span>

        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink-900">We use cookies</h2>
          <p className="mt-1 text-sm text-ink-700">
            We use cookies to understand how visitors use our website so we can improve it. You can accept or decline
            analytics cookies.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => choose(false)} className="btn btn-outline">
          Decline
        </button>
        <button type="button" onClick={() => choose(true)} className="btn btn-primary">
          Accept All
        </button>
      </div>
    </div>
  );
}