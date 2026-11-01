// models/sync-indexes.ts

import "dotenv/config";
import mongoose from "mongoose";
import Appointment from "./Appointment";
import Schedule from "./Schedule";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  await Appointment.syncIndexes();
  await Schedule.syncIndexes();
  console.log("Indexes synced");
  await mongoose.disconnect();
}

main();
