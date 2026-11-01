// model/Dentists.ts

import { Schema, model, models } from "mongoose";

const DentistSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    specialty: { type: String, default: "General Dentist" },
    bio: { type: String, default: "" },
    photo: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default models.Dentist || model("Dentist", DentistSchema);
