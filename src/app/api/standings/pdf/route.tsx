import { auth } from "@/auth";
import { computeStandings } from "@/lib/standings";
import { getMinGamesForOfficialRanking } from "@/lib/ranking-config";
import { StandingsPdfDocument } from "@/components/pdf/StandingsPdfDocument";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.groupId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const standings = await computeStandings(session.user.groupId);
  const minGames = getMinGamesForOfficialRanking();
  const minGamesLabel = `Ranking principal: mín. ${minGames} partidos`;

  const buffer = await renderToBuffer(
    <StandingsPdfDocument
      standings={standings}
      generatedAt={new Date()}
      minGamesLabel={minGamesLabel}
    />,
  );

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="tabla-americano.pdf"',
      "Cache-Control": "private, no-store",
    },
  });
}
