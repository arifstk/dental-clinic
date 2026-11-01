// models/Schedule.ts

import { Schema, model, models } from "mongoose";

// One document per dentist per weekday. weekday: 0 = Sunday ... 6 = Saturday
const ScheduleSchema = new Schema(
  {
    dentistId: {
      type: Schema.Types.ObjectId,
      ref: "Dentist",
      required: true,
      index: true,
    },
    weekday: { type: Number, min: 0, max: 6, required: true },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true }, // "17:00"
    slotMinutes: { type: Number, default: 30 },
    breakStart: { type: String, default: "" }, // "13:00"
    breakEnd: { type: String, default: "" }, // "14:00"
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

ScheduleSchema.index({ dentistId: 1, weekday: 1 }, { unique: true });

export default models.Schedule || model("Schedule", ScheduleSchema);
