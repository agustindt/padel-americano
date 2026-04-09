import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildGroupCalendarIcs } from "@/lib/calendar-ics";
import { BRAND_NAME } from "@/lib/brand";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.groupId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const rounds = await prisma.round.findMany({
    where: {
      groupId: session.user.groupId,
      scheduledAt: { not: null },
      status: { in: ["CONFIRMED", "PLAYED"] },
    },
    orderBy: { scheduledAt: "asc" },
    select: {
      id: true,
      title: true,
      scheduledAt: true,
      venue: true,
    },
  });

  const ics = buildGroupCalendarIcs({
    calname: `${BRAND_NAME} · fechas`,
    rounds: rounds.map((r) => ({
      id: r.id,
      title: r.title,
      scheduledAt: r.scheduledAt,
      venue: r.venue,
    })),
  });

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="americano-fechas.ics"',
      "Cache-Control": "private, no-store",
    },
  });
}
