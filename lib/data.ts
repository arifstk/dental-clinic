// lib/data.ts
// Cached public data (services, dentists). Never put slots / appointments here.

import { cacheLife, cacheTag } from "next/cache";
import { connectDB } from "@/lib/db";
import Dentist from "@/models/Dentist";
import Service from "@/models/Service";
import { TAGS, failOnBuild } from "@/lib/cache";

export type ServiceItem = {
  id: string;
  name: string;
  description: string;
  minutes: number;
  price: number;
};

export type DentistItem = {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  photo: string;
};

type ServiceRow = {
  _id: unknown;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
};

type DentistRow = {
  _id: unknown;
  name: string;
  specialty?: string;
  bio?: string;
  photo?: string;
};

async function loadServices(): Promise<ServiceItem[]> {
  "use cache";
  cacheTag(TAGS.services);
  cacheLife("content");

  await connectDB();
  const rows = await Service.find({ active: true })
    .sort({ name: 1 })
    .lean<ServiceRow[]>();

  return rows.map((r) => ({
    id: String(r._id),
    name: r.name,
    description: r.description ?? "",
    minutes: r.durationMinutes,
    price: r.price,
  }));
}

async function loadDentists(): Promise<DentistItem[]> {
  "use cache";
  cacheTag(TAGS.dentists);
  cacheLife("content");

  await connectDB();
  const rows = await Dentist.find({ active: true })
    .sort({ name: 1 })
    .lean<DentistRow[]>();

  return rows.map((r) => ({
    id: String(r._id),
    name: r.name,
    specialty: r.specialty || "Dentist",
    bio: r.bio ?? "",
    photo: r.photo ?? "",
  }));
}

export async function getActiveServices(): Promise<ServiceItem[]> {
  try {
    return await loadServices();
  } catch (err) {
    failOnBuild(err);
    console.error("getActiveServices failed:", err);
    return [];
  }
}

export async function getActiveDentists(): Promise<DentistItem[]> {
  try {
    return await loadDentists();
  } catch (err) {
    failOnBuild(err);
    console.error("getActiveDentists failed:", err);
    return [];
  }
}
