// scripts/sync-indexes.ts

import Appointment from "@/models/Appointment";
import Schedule from "@/models/Schedule";
import "dotenv/config";
import mongoose from "mongoose";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  await Appointment.syncIndexes();
  await Schedule.syncIndexes();
  console.log("Indexes synced");
  await mongoose.disconnect();
}

main();
