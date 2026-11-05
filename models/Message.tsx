// models/Message.ts

import { Schema, model, models, type Model } from "mongoose";

const ReplySchema = new Schema(
  {
    subject: { type: String, default: "", trim: true },
    body: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const MessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    message: { type: String, required: true },
    marked: { type: Boolean, default: false, index: true },
    replies: { type: [ReplySchema], default: [] },
  },
  { timestamps: true },
);

const Message: Model<any> = models.Message || model("Message", MessageSchema);

export default Message;
