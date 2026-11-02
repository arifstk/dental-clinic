// components/site/Navbar.tsx

"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import { navLinks, site } from "@/lib/site";
import Logo from "./Logo";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className={`nav-link ${isActive(l.href) ? "nav-link-active" : ""}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href={site.phoneHref} className="nav-link hidden items-center gap-2 lg:flex">
            <Phone size={16} aria-hidden />
            {site.phone}
          </a>
          <Link href="/booking" className="btn btn-primary btn-sm hidden sm:inline-flex">
            Book appointment
          </Link>
          <button
            type="button"
            className="btn btn-ghost px-2.5 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" className="border-t border-line bg-white md:hidden" aria-label="Mobile">
          <div className="container-page flex flex-col py-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`nav-link py-3 text-base ${isActive(l.href) ? "nav-link-active" : ""}`}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/booking" onClick={() => setOpen(false)} className="btn btn-primary btn-block my-3">
              Book appointment
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
