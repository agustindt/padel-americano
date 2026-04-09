import { CreateRoundForm } from "@/components/CreateRoundForm";
import { ManualMatchForm } from "@/components/ManualMatchForm";
import { MatchScoreForm } from "@/components/MatchScoreForm";
import { RoundStatusForm } from "@/components/RoundStatusForm";
import { computeStandings } from "@/lib/standings";
import { parseSetScoresFromDb } from "@/lib/match-sets";
import { prisma } from "@/lib/prisma";
import { formatRoundDateTime } from "@/lib/datetime";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Fechas",
};

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "Borrador",
  CONFIRMED: "Confirmada",
  PLAYED: "Jugada",
};

export default async function FechasPage() {
  const session = await auth();
  const groupId = session?.user?.groupId;
  if (!groupId) {
    redirect("/login");
  }

  const [rounds, standings, users] = await Promise.all([
    prisma.round.findMany({
      where: { groupId },
      orderBy: { sortOrder: "desc" },
      include: {
        matches: {
          include: {
            playerA1: { select: { id: true, name: true } },
            playerA2: { select: { id: true, name: true } },
            playerB1: { select: { id: true, name: true } },
            playerB2: { select: { id: true, name: true } },
          },
          orderBy: { courtLabel: "asc" },
        },
        sitOuts: {
          include: { user: { select: { name: true } } },
        },
      },
    }),
    computeStandings(groupId),
    prisma.user.findMany({
      where: { groupId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const statsByUserId = Object.fromEntries(
    standings.map((s) => [s.userId, { wins: s.wins, played: s.played }]),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Fechas y cruces"
        description="Podés crear una fecha con sorteo para todo el grupo o un partido manual con cuatro jugadores elegidos. Cargá los juegos de cada partido (ej. 6–4) para actualizar la tabla; el 0–0 no suma hasta que pongas el marcador real."
      />

      <p className="text-sm">
        <a
          href="/api/calendar/ics"
          className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
        >
          Suscribirse / Agregar al calendario (.ics)
        </a>
        <span className="text-[var(--muted)]"> — solo fechas confirmadas o jugadas con día y hora cargados.</span>
      </p>

      <CreateRoundForm />

      <ManualMatchForm users={users} statsByUserId={statsByUserId} />

      <div className="space-y-6">
        {rounds.length === 0 ? (
          <EmptyState
            emoji="📅"
            title="Sin fechas todavía"
            description="Creá la primera con el formulario de arriba: se sortean parejas y canchas al instante."
          />
        ) : (
          rounds.map((round) => {
            const when = formatRoundDateTime(round.scheduledAt);
            return (
              <Card
                key={round.id}
                className={cn(
                  "p-4 sm:p-5",
                  round.status === "DRAFT" && "border-dashed opacity-90",
                )}
              >
                <header className="mb-4 flex flex-col gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2
                        className={cn(
                          "break-words font-display text-2xl uppercase tracking-wide text-[var(--foreground)]",
                          round.status === "DRAFT" && "line-through decoration-[var(--muted)]",
                        )}
                      >
                        {round.title || `Fecha ${round.sortOrder}`}
                      </h2>
                      {round.kind === "MANUAL_SINGLE" && (
                        <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Manual
                        </span>
                      )}
                      <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                        {STATUS_BADGE[round.status] ?? round.status}
                      </span>
                    </div>
                    {when && (
                      <time className="mt-1 block text-sm text-[var(--muted)]" dateTime={round.scheduledAt?.toISOString()}>
                        {when}
                      </time>
                    )}
                    {round.venue && (
                      <p className="mt-2 break-words text-sm font-medium text-[var(--foreground)]">{round.venue}</p>
                    )}
                    {round.mapsUrl && (
                      <a
                        href={round.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex min-h-11 touch-manipulation items-center text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
                      >
                        Cómo llegar
                      </a>
                    )}
                  </div>
                  <RoundStatusForm roundId={round.id} status={round.status} />
                </header>

                <div className="space-y-3">
                  {round.matches.map((m) => (
                    <MatchScoreForm
                      key={`${m.id}-${JSON.stringify(m.setScores ?? null)}`}
                      matchId={m.id}
                      courtLabel={m.courtLabel}
                      a1={m.playerA1}
                      a2={m.playerA2}
                      b1={m.playerB1}
                      b2={m.playerB2}
                      setScores={parseSetScoresFromDb(m.setScores)}
                    />
                  ))}
                </div>

                {round.sitOuts.length > 0 && (
                  <div className="mt-4 rounded-[var(--radius-sm)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--muted)]">
                    <span className="font-medium text-[var(--foreground)]">Descansan esta fecha: </span>
                    {round.sitOuts.map((s) => s.user.name).join(", ")}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
