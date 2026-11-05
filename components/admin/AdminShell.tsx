// components/admin/AdminShell.tsx

"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CalendarOff,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  Menu,
  Smile,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { site } from "@/lib/site";
import LogoutButton from "./LogoutButton";

type Role = "admin" | "receptionist";

const items = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/admin/dentists", label: "Dentists", icon: Stethoscope },
  { href: "/admin/services", label: "Services", icon: ClipboardList },
  { href: "/admin/timeoff", label: "Time off", icon: CalendarOff },
  { href: "/admin/staff", label: "Staff", icon: Users, adminOnly: true },
  { href: "/admin/settings", label: "Settings", icon: ExternalLink },
];

export default function AdminShell({
  name,
  role,
  children,
}: {
  name: string;
  role: Role;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const visible = items.filter((i) => !i.adminOnly || role === "admin");

  const nav = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-line px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
          <Smile size={20} aria-hidden />
        </span>
        <span className="font-bold tracking-tight text-ink-900">{site.name}</span>
      </div>

      <nav className="flex-1 space-y-1 p-3" aria-label="Admin">
        {visible.map((i) => {
          const active = pathname.startsWith(i.href);
          return (
            <Link
              key={i.href}
              href={i.href}
              onClick={() => setOpen(false)}
              className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <i.icon size={18} aria-hidden />
              {i.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="sidebar-link">
          <ExternalLink size={18} aria-hidden />
          View website
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-line bg-white lg:block">{nav}</aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-ink-900/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-pop">
            <button
              type="button"
              aria-label="Close menu"
              className="btn btn-ghost absolute top-3 right-3 px-2"
              onClick={() => setOpen(false)}
            >
              <X size={20} />
            </button>
            {nav}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            aria-label="Open menu"
            className="btn btn-ghost px-2.5 lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm leading-tight font-semibold text-ink-900">{name}</p>
              <span className="badge badge-neutral capitalize">{role}</span>
            </div>
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
