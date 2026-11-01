// models/Service.ts

import { Schema, model, models } from "mongoose";

const ServiceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    durationMinutes: { type: Number, default: 30 },
    price: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default models.Service || model("Service", ServiceSchema);
