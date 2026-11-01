// scripts/seed-admin.ts

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";

async function main() {
  const uri = process.env.MONGODB_URI as string;
  const email = process.env.SEED_ADMIN_EMAIL as string;
  const password = process.env.SEED_ADMIN_PASSWORD as string;
  if (!uri || !email || !password) throw new Error("Missing env values");

  await mongoose.connect(uri);
  const exists = await User.findOne({ email });
  if (exists) {
    console.log("Admin already exists");
  } else {
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      name: "Clinic Admin",
      email,
      password: hash,
      role: "admin",
    });
    console.log("Admin created:", email);
  }
  await mongoose.disconnect();
}

main();
