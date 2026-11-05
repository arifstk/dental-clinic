// models/SiteSettings.ts

import { Schema, model, models, type Model } from "mongoose";

const HourSchema = new Schema(
  {
    days: { type: String, required: true, trim: true },
    time: { type: String, default: "", trim: true },
    closed: { type: Boolean, default: false },
  },
  { _id: false },
);

const SiteSettingsSchema = new Schema(
  {
    // Singleton document: always key = "main"
    key: { type: String, default: "main", unique: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    mapsUrl: { type: String, default: "", trim: true },
    hours: { type: [HourSchema], default: [] },
  },
  { timestamps: true },
);

const SiteSettings: Model<any> =
  models.SiteSettings || model("SiteSettings", SiteSettingsSchema);

export default SiteSettings;