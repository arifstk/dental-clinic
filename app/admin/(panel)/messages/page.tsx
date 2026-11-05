// app/admin/(panel)/messages/page.tsx

import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import MessagesList, { MessageItem } from "@/components/admin/MessagesList";

export const metadata: Metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  await connectDB();
  const docs = await Message.find().sort({ createdAt: -1 }).limit(500).lean();

  const items: MessageItem[] = docs.map((m: any) => ({
    id: String(m._id),
    name: m.name,
    email: m.email,
    phone: m.phone || "",
    message: m.message,
    marked: !!m.marked,
    createdAt: new Date(m.createdAt).toISOString(),
    replies: (m.replies ?? []).map((r: any) => ({
      subject: r.subject || "",
      body: r.body,
      sentAt: new Date(r.sentAt).toISOString(),
    })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Messages</h1>
        <p className="muted mt-1">Messages sent from the public Contact form.</p>
      </div>
      <MessagesList initial={items} />
    </div>
  );
}
