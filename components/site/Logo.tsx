// components/site/Logo.tsx

import Link from "next/link";
import { Smile } from "lucide-react";
import { site } from "@/lib/site";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={`${site.name} home`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
        <Smile size={20} aria-hidden />
      </span>
      <span className="text-lg font-bold tracking-tight text-ink-900">{site.name}</span>
    </Link>
  );
}
