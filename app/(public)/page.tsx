// app/(public)/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  Baby,
  CalendarCheck,
  Check,
  Clock,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Smile,
  Sparkles,
  Stethoscope,
  UserRound,
} from "lucide-react";
import Hero from "@/components/Hero";
import { getSiteSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo";
import LocalBusinessJsonLd from "@/components/seo/JsonLd";
// import { LocalBusinessJsonLd } from "@/components/seo/JsonLd";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return buildMetadata(s.name, {
    title: `${s.name} | Book a Dentist Appointment Online`,
    absoluteTitle: true,
    description: "Choose your dentist, pick a time, and get an instant confirmation. Online dental appointment booking.",
    path: "/",
  });
}

const steps = [
  { icon: UserRound, title: "Choose your dentist", text: "Browse our dentists and pick the one you prefer." },
  { icon: CalendarCheck, title: "Pick a date and time", text: "See live availability and select a slot that suits you." },
  { icon: Mail, title: "Get instant confirmation", text: "Receive an email right away with a link to cancel or reschedule." },
];

const services = [
  { icon: Stethoscope, title: "General check-up", text: "Routine exams to keep your teeth and gums healthy." },
  { icon: Sparkles, title: "Cleaning and whitening", text: "Remove stains and plaque for a brighter smile." },
  { icon: ShieldCheck, title: "Fillings and restoration", text: "Repair cavities and damaged teeth comfortably." },
  { icon: Smile, title: "Braces and aligners", text: "Straighten your teeth with a plan made for you." },
  { icon: Baby, title: "Children's dentistry", text: "Gentle, friendly care for our youngest patients." },
  { icon: HeartPulse, title: "Emergency care", text: "Quick help for pain, swelling, or broken teeth." },
];

const reasons = [
  { icon: Clock, title: "Flexible hours", text: "Appointments that fit around work and school." },
  { icon: ShieldCheck, title: "Clean and safe", text: "Strict sterilisation and hygiene standards." },
  { icon: Smile, title: "Gentle care", text: "A calm, comfortable experience for every patient." },
  { icon: Mail, title: "Easy changes", text: "Cancel or reschedule online from your confirmation email." },
];

export default function HomePage() {
  return (
    <>
      <LocalBusinessJsonLd />

      {/* Hero */}
      <Hero />

      {/* How it works */}
      <section className="section">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">How it works</p>
            <h2 className="heading-2 mt-2">Book in three simple steps</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="card">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <s.icon size={22} aria-hidden />
                  </span>
                  <span className="text-3xl font-bold text-primary-100">0{i + 1}</span>
                </div>
                <h3 className="heading-3 mt-5">{s.title}</h3>
                <p className="muted mt-2">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section section-alt">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="eyebrow">Our services</p>
              <h2 className="heading-2 mt-2">Complete care for the whole family</h2>
            </div>
            <Link href="/services" className="link">
              View all services
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div key={s.title} className="card card-hover">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <s.icon size={22} aria-hidden />
                </span>
                <h3 className="heading-3 mt-5">{s.title}</h3>
                <p className="muted mt-2">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="section">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">Why choose us</p>
            <h2 className="heading-2 mt-2">Care that is easy from start to finish</h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((r) => (
              <div key={r.title}>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                  <r.icon size={20} aria-hidden />
                </span>
                <h3 className="heading-3 mt-4">{r.title}</h3>
                <p className="muted mt-1.5">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-14 sm:pb-20">
        <div className="container-page">
          <div className="rounded-card bg-primary-700 p-8 text-white sm:p-12">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">Ready for a healthier smile?</h2>
            <p className="mt-3 max-w-xl text-primary-100">
              Book your appointment online in under a minute. We will send a confirmation straight to your inbox.
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

