// models/Appointment.ts

import { Schema, model, models } from "mongoose";
import crypto from "crypto";

const AppointmentSchema = new Schema(
  {
    dentistId: {
      type: Schema.Types.ObjectId,
      ref: "Dentist",
      required: true,
      index: true,
    },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", default: null },
    patientName: { type: String, required: true, trim: true },
    patientPhone: { type: String, required: true, trim: true },
    patientEmail: { type: String, required: true, lowercase: true, trim: true },
    notes: { type: String, default: "" },
    startTime: { type: Date, required: true }, // stored in UTC
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed", "no_show"],
      default: "confirmed",
    },
    source: {
      type: String,
      enum: ["online", "phone", "walk_in"],
      default: "online",
    },
    manageToken: {
      type: String,
      default: () => crypto.randomBytes(24).toString("hex"),
      index: true,
    },
    reminder24Sent: { type: Boolean, default: false },
    reminder2Sent: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Core double-booking guard at database level
AppointmentSchema.index(
  { dentistId: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { status: "confirmed" } },
);

export default models.Appointment || model("Appointment", AppointmentSchema);
