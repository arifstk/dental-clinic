// components/GAPageTracker.tsx

"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pageview } from "@/lib/gtag";

export default function GAPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const first = useRef(true);

  useEffect(() => {
    // The first page view is sent by gtag('config'); only track later navigation here
    if (first.current) {
      first.current = false;
      return;
    }
    if (pathname.startsWith("/admin")) return;
    const q = searchParams.toString();
    pageview(q ? `${pathname}?${q}` : pathname);
  }, [pathname, searchParams]);

  return null;
}
