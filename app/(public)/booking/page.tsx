// app/(public)/booking/page.tsx

import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { connectDB } from "@/lib/db";
import Dentist from "@/models/Dentist";
import Service from "@/models/Service";
import { dateKeyFromUtc } from "@/lib/slots";
import { env } from "@/lib/env";
import { site } from "@/lib/site";
import BookingFlow from "@/components/booking/BookingFlow";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book an appointment",
  description: "Choose your dentist, pick a time, and get an instant confirmation.",
};

type DentistRow = { _id: unknown; name: string; specialty?: string; photo?: string };
type ServiceRow = { _id: unknown; name: string; durationMinutes: number };

export default async function BookingPage() {
  await connectDB();

  const [dentists, services] = await Promise.all([
    Dentist.find({ active: true }).sort({ name: 1 }).lean<DentistRow[]>(),
    Service.find({ active: true }).sort({ name: 1 }).lean<ServiceRow[]>(),
  ]);

  const now = new Date();

  return (
    <section className="section bg-hero">
      <div className="container-page">
        <div className="mb-8 max-w-2xl">
          <p className="eyebrow">Online booking</p>
          <h1 className="heading-1 mt-2">Book your appointment</h1>
          <p className="lead mt-3">Choose a dentist and a time that suits you. You will get an instant confirmation.</p>
        </div>

        {dentists.length === 0 ? (
          <div className="card max-w-xl">
            <p className="text-ink-700">Online booking is not available right now. Please call us to book.</p>
            <a href={site.phoneHref} className="btn btn-primary mt-4">
              <Phone size={16} aria-hidden />
              {site.phone}
            </a>
          </div>
        ) : (
          <BookingFlow
            dentists={dentists.map((d) => ({
              id: String(d._id),
              name: d.name,
              specialty: d.specialty || "Dentist",
              photo: d.photo || "",
            }))}
            services={services.map((s) => ({
              id: String(s._id),
              name: s.name,
              durationMinutes: s.durationMinutes,
            }))}
            tz={env.CLINIC_TZ}
            todayKey={dateKeyFromUtc(now)}
            maxKey={dateKeyFromUtc(new Date(now.getTime() + 60 * 86400000))}
          />
        )}
      </div>
    </section>
  );
}
