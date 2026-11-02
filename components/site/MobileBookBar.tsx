// components/site/MobileBookBar.tsx

import Link from "next/link";
import { CalendarCheck, Phone } from "lucide-react";
import { site } from "@/lib/site";

export default function MobileBookBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-2 gap-3 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <a href={site.phoneHref} className="btn btn-outline">
          <Phone size={16} aria-hidden />
          Call
        </a>
        <Link href="/booking" className="btn btn-primary">
          <CalendarCheck size={16} aria-hidden />
          Book now
        </Link>
      </div>
    </div>
  );
}
