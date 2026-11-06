// app/(public)/booking/page.tsx

import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { Phone } from "lucide-react";
import { getActiveDentists, getActiveServices } from "@/lib/data";
import { getSiteSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo";
import { dateKeyFromUtc } from "@/lib/slots";
import { env } from "@/lib/env";
import BookingFlow from "@/components/booking/BookingFlow";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return buildMetadata(s.name, {
    title: "Book an appointment",
    description: "Choose your dentist, pick a time, and get an instant confirmation.",
    path: "/booking",
  });
}

// Static shell
export default function BookingPage() {
  return (
    <section className="section bg-hero">
      <div className="container-page">
        <div className="mb-8 max-w-2xl">
          <p className="eyebrow">Online booking</p>
          <h1 className="heading-1 mt-2">Book your appointment</h1>
          <p className="lead mt-3">Choose a dentist and a time that suits you. You will get an instant confirmation.</p>
        </div>

        <Suspense fallback={<div className="card h-96 animate-pulse" aria-hidden />}>
          <BookingContent />
        </Suspense>
      </div>
    </section>
  );
}

async function BookingContent() {
  const [dentists, services, s] = await Promise.all([
    getActiveDentists(), // cached
    getActiveServices(), // cached
    getSiteSettings(), // cached
  ]);

  if (dentists.length === 0) {
    return (
      <div className="card max-w-xl">
        <p className="text-ink-700">Online booking is not available right now. Please call us to book.</p>
        <a href={s.phoneHref} className="btn btn-primary mt-4">
          <Phone size={16} aria-hidden />
          {s.phone}
        </a>
      </div>
    );
  }

  await connection();
  const now = new Date();

  return (
    <BookingFlow
      dentists={dentists.map((d) => ({
        id: d.id,
        name: d.name,
        specialty: d.specialty,
        photo: d.photo,
      }))}
      services={services.map((x) => ({
        id: x.id,
        name: x.name,
        durationMinutes: x.minutes,
      }))}
      tz={env.CLINIC_TZ}
      todayKey={dateKeyFromUtc(now)}
      maxKey={dateKeyFromUtc(new Date(now.getTime() + 60 * 86400000))}
    />
  );
}
