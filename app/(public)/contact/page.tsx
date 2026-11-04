// app/(public)/contact/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { mapsEmbedUrl, site } from "@/lib/site";
import ContactForm from "@/components/site/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: `Find ${site.name}, see our opening hours, or send us a message.`,
};

export default function ContactPage() {
  return (
    <>
      <section className="section bg-hero">
        <div className="container-page max-w-3xl">
          <p className="eyebrow">Contact</p>
          <h1 className="heading-1 mt-2">We would love to hear from you</h1>
          <p className="lead mt-4">
            Call us, send a message, or visit the clinic. To book a visit, the fastest way is online.
          </p>
          <Link href="/booking" className="btn btn-primary btn-lg mt-6">
            Book appointment
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="space-y-5">
            <div className="card">
              <ul className="space-y-5 text-sm text-ink-700">
                <li className="flex gap-3">
                  <MapPin size={20} className="mt-0.5 shrink-0 text-primary-600" aria-hidden />
                  <span>
                    <span className="block font-semibold text-ink-900">Address</span>
                    <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary-700">
                      {site.address}
                    </a>
                  </span>
                </li>
                <li className="flex gap-3">
                  <Phone size={20} className="mt-0.5 shrink-0 text-primary-600" aria-hidden />
                  <span>
                    <span className="block font-semibold text-ink-900">Phone</span>
                    <a href={site.phoneHref} className="hover:text-primary-700">
                      {site.phone}
                    </a>
                  </span>
                </li>
                <li className="flex gap-3">
                  <Mail size={20} className="mt-0.5 shrink-0 text-primary-600" aria-hidden />
                  <span>
                    <span className="block font-semibold text-ink-900">Email</span>
                    <a href={`mailto:${site.email}`} className="hover:text-primary-700">
                      {site.email}
                    </a>
                  </span>
                </li>
                {site.hours.map((h) => (
                  <li key={h.days} className="flex gap-3">
                    <Clock size={20} className="mt-0.5 shrink-0 text-primary-600" aria-hidden />
                    <span>
                      <span className="block font-semibold text-ink-900">{h.days}</span>
                      {h.time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <iframe
              src={mapsEmbedUrl}
              title={`Map showing ${site.name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-72 w-full rounded-card border border-line sm:h-80"
            />
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  );
}
