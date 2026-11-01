// model/TimeOff.ts

import { Schema, model, models } from "mongoose";

// dentistId null means the whole clinic is closed
const TimeOffSchema = new Schema(
  {
    dentistId: {
      type: Schema.Types.ObjectId,
      ref: "Dentist",
      default: null,
      index: true,
    },
    startDate: { type: String, required: true }, // "2026-11-10"
    endDate: { type: String, required: true }, // "2026-11-12"
    reason: { type: String, default: "" },
  },
  { timestamps: true },
);

export default models.TimeOff || model("TimeOff", TimeOffSchema);
