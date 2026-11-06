// app/public/services/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { Baby, Clock, HeartPulse, ShieldCheck, Smile, Sparkles, Stethoscope } from "lucide-react";
import { getActiveServices } from "@/lib/data";
import { getSiteSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return buildMetadata(s.name, {
    title: "Services",
    description: "Check-ups, cleaning, fillings, braces, children's dentistry and emergency care. Book online in a minute.",
    path: "/services",
  });
}

type Item = { id: string; name: string; description: string; minutes?: number; price?: number };

const ICONS = [Stethoscope, Sparkles, ShieldCheck, Smile, Baby, HeartPulse];

const FALLBACK: Item[] = [
  { id: "f1", name: "General check-up", description: "Routine exams to keep your teeth and gums healthy." },
  { id: "f2", name: "Cleaning and whitening", description: "Remove stains and plaque for a brighter smile." },
  { id: "f3", name: "Fillings and restoration", description: "Repair cavities and damaged teeth comfortably." },
  { id: "f4", name: "Braces and aligners", description: "Straighten your teeth with a plan made for you." },
  { id: "f5", name: "Children's dentistry", description: "Gentle, friendly care for our youngest patients." },
  { id: "f6", name: "Emergency care", description: "Quick help for pain, swelling, or broken teeth." },
];

async function getServices(): Promise<Item[]> {
  const rows = await getActiveServices(); // cached
  return rows.length ? rows : FALLBACK;
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <section className="section bg-hero">
        <div className="container-page max-w-3xl">
          <p className="eyebrow">Our services</p>
          <h1 className="heading-1 mt-2">Complete dental care for the whole family</h1>
          <p className="lead mt-4">
            From routine check-ups to specialist treatment, choose a service and book a time that suits you.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <div key={s.id} className="card card-hover flex flex-col">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Icon size={22} aria-hidden />
                  </span>
                  <h2 className="heading-3 mt-5">{s.name}</h2>
                  {s.description && <p className="muted mt-2 flex-1">{s.description}</p>}

                  {(s.minutes || (s.price ?? 0) > 0) && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {s.minutes ? (
                        <span className="badge badge-neutral gap-1">
                          <Clock size={12} aria-hidden />
                          {s.minutes} min
                        </span>
                      ) : null}
                      {(s.price ?? 0) > 0 && (
                        <span className="badge badge-success">BDT {s.price!.toLocaleString("en-US")}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 rounded-card bg-primary-700 p-8 text-center text-white sm:p-10">
            <h2 className="text-2xl font-semibold text-white">Not sure which service you need?</h2>
            <p className="mx-auto mt-2 max-w-xl text-primary-100">
              Book a general check-up and your dentist will guide you from there.
            </p>
            <Link href="/booking" className="btn btn-light btn-lg mt-6">
              Book appointment
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
