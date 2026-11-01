// app/api/admin/dentists/[id]/schedule/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Schedule from "@/models/Schedule";
import { scheduleSchema } from "@/lib/validators";
import {
  guard,
  unauthorized,
  invalid,
  notFound,
  isValidId,
  IdCtx,
} from "@/lib/admin";

const DEFAULT_DAY = {
  enabled: false,
  startTime: "09:00",
  endTime: "17:00",
  slotMinutes: 30,
  breakStart: "",
  breakEnd: "",
};

export async function GET(_req: Request, { params }: IdCtx) {
  if (!(await guard())) return unauthorized();
  const { id } = await params;
  if (!isValidId(id)) return notFound();

  await connectDB();
  const rows = await Schedule.find({ dentistId: id }).lean<
    {
      weekday: number;
      enabled: boolean;
      startTime: string;
      endTime: string;
      slotMinutes: number;
      breakStart: string;
      breakEnd: string;
    }[]
  >();

  // Always return all 7 days so the editor can render a full week
  const days = Array.from({ length: 7 }, (_, weekday) => {
    const r = rows.find((x) => x.weekday === weekday);
    return r
      ? {
          weekday,
          enabled: r.enabled,
          startTime: r.startTime,
          endTime: r.endTime,
          slotMinutes: r.slotMinutes,
          breakStart: r.breakStart,
          breakEnd: r.breakEnd,
        }
      : { weekday, ...DEFAULT_DAY };
  });
  return NextResponse.json({ days });
}

export async function PUT(req: Request, { params }: IdCtx) {
  if (!(await guard())) return unauthorized();
  const { id } = await params;
  if (!isValidId(id)) return notFound();

  const parsed = scheduleSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error.flatten());

  await connectDB();
  await Schedule.bulkWrite(
    parsed.data.days.map(({ weekday, ...rest }) => ({
      updateOne: {
        filter: { dentistId: id, weekday },
        update: { $set: rest },
        upsert: true,
      },
    })),
  );
  return NextResponse.json({ ok: true });
}
