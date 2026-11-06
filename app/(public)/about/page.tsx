// app/(public)/about/page.tsx

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HeartPulse, ShieldCheck, Smile, UserRound } from "lucide-react";
import { getActiveDentists } from "@/lib/data";
import { getSiteSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return buildMetadata(s.name, {
    title: "About us",
    description: "Meet our dentists and learn how we make dental care comfortable, clear, and easy to book.",
    path: "/about",
  });
}

const values = [
  {
    icon: Smile,
    title: "Comfort first",
    text: "A calm, friendly visit from the moment you walk in. We explain every step before we begin.",
  },
  {
    icon: ShieldCheck,
    title: "Clean and safe",
    text: "Strict sterilisation and hygiene standards, so you and your family can relax.",
  },
  {
    icon: HeartPulse,
    title: "Clear and honest",
    text: "Clear advice and clear pricing. You decide with full information.",
  },
];

export default async function AboutPage() {
  const [dentists, s] = await Promise.all([getActiveDentists(), getSiteSettings()]);

  return (
    <>
      <section className="section bg-hero">
        <div className="container-page max-w-3xl">
          <p className="eyebrow">About us</p>
          <h1 className="heading-1 mt-2">Dental care that feels easy</h1>
          <p className="lead mt-4">
            At {s.name}, we believe a dental visit should be comfortable, clear, and simple to arrange. That is why you
            can book online in under a minute, and change your plans whenever you need.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="grid gap-5 md:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="card">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <v.icon size={22} aria-hidden />
                </span>
                <h2 className="heading-3 mt-5">{v.title}</h2>
                <p className="muted mt-2">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {dentists.length > 0 && (
        <section className="section section-alt">
          <div className="container-page">
            <p className="eyebrow">Our team</p>
            <h2 className="heading-2 mt-2">Meet our dentists</h2>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {dentists.map((d) => (
                <article key={d.id} className="card overflow-hidden p-0 sm:p-0">
                  {d.photo ? (
                    <Image
                      src={d.photo}
                      alt={`${d.name}, ${d.specialty}`}
                      width={600}
                      height={600}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-primary-50 text-primary-300">
                      <UserRound size={72} aria-hidden />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="heading-3">{d.name}</h3>
                    <p className="text-sm font-medium text-primary-700">{d.specialty || "Dentist"}</p>
                    {d.bio && <p className="muted mt-3">{d.bio}</p>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container-page">
          <div className="rounded-card bg-primary-700 p-8 text-center text-white sm:p-10">
            <h2 className="text-2xl font-semibold text-white">Ready to visit us?</h2>
            <p className="mx-auto mt-2 max-w-xl text-primary-100">Choose your dentist and a time that works for you.</p>
            <Link href="/booking" className="btn btn-light btn-lg mt-6">
              Book appointment
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
