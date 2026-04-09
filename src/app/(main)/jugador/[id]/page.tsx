import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { computeStandings } from "@/lib/standings";
import { getMinGamesForOfficialRanking } from "@/lib/ranking-config";
import { getPlayerMatchHistory, getTeammateFrequency } from "@/lib/player-stats";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true },
  });
  return {
    title: user?.name ? user.name : "Jugador",
  };
}

type Props = { params: Promise<{ id: string }> };

function formatWinRate(winRate: number | null, played: number): string {
  if (played === 0 || winRate === null) return "—";
  return `${Math.round(winRate * 100)}%`;
}

export default async function JugadorPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.groupId) notFound();

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, groupId: true },
  });
  if (!user || user.groupId !== session.user.groupId) notFound();

  const [standings, history, mates, minGames] = await Promise.all([
    computeStandings(session.user.groupId),
    getPlayerMatchHistory(id, session.user.groupId, 20),
    getTeammateFrequency(id, session.user.groupId),
    Promise.resolve(getMinGamesForOfficialRanking()),
  ]);

  const row = standings.find((r) => r.userId === id);
  if (!row) {
    notFound();
  }

  let streak = 0;
  for (const h of history) {
    if (h.won === true) streak++;
    else if (h.won === false) break;
    else break;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={user.name}
        description={`PJ ${row.played} · ${row.wins}G ${row.losses}P ${row.draws}E · ${row.points} pts · % victorias ${formatWinRate(row.winRate, row.played)}`}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <h2 className="font-display text-xl uppercase tracking-wide text-[var(--foreground)]">Resumen</h2>
          <dl className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            <div className="flex justify-between gap-4">
              <dt>Partidos jugados</dt>
              <dd className="tabular-nums font-medium text-[var(--foreground)]">{row.played}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Victorias</dt>
              <dd className="tabular-nums font-medium text-emerald-700 dark:text-emerald-400">{row.wins}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Derrotas</dt>
              <dd className="tabular-nums text-[var(--foreground)]">{row.losses}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Empates</dt>
              <dd className="tabular-nums text-[var(--foreground)]">{row.draws}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Puntos</dt>
              <dd className="tabular-nums font-semibold text-[var(--foreground)]">{row.points}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>% victorias</dt>
              <dd className="tabular-nums font-medium text-[var(--foreground)]">
                {formatWinRate(row.winRate, row.played)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Racha actual (victorias)</dt>
              <dd className="tabular-nums font-medium text-[var(--foreground)]">{streak}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Mín. para ranking principal</dt>
              <dd className="text-[var(--foreground)]">{row.meetsMinimumGames ? "Sí" : `No (hacen falta ${minGames} PJ)`}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-4 sm:p-5">
          <h2 className="font-display text-xl uppercase tracking-wide text-[var(--foreground)]">
            Parejas con las que jugaste más
          </h2>
          {mates.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted)]">Todavía no hay datos.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {mates.map((m) => (
                <li key={m.name} className="flex justify-between gap-2 border-b border-[var(--border)] border-dashed pb-2 last:border-0">
                  <span>{m.name}</span>
                  <span className="tabular-nums text-[var(--muted)]">{m.count} partidos</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-[var(--border)] bg-[var(--surface-muted)]/50 px-4 py-3">
          <h2 className="font-display text-xl uppercase tracking-wide text-[var(--foreground)]">Últimos partidos</h2>
        </div>
        {history.length === 0 ? (
          <p className="p-4 text-sm text-[var(--muted)]">Sin partidos cerrados todavía.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {history.map((h) => (
              <li key={h.matchId} className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="font-medium text-[var(--foreground)]">{h.display}</span>
                  <span className="text-[var(--muted)]"> vs {h.opponentNames}</span>
                  {h.roundTitle && (
                    <p className="text-xs text-[var(--muted)]">{h.roundTitle}</p>
                  )}
                </div>
                <div className="shrink-0 text-xs font-medium uppercase tracking-wide">
                  {h.won === true && <span className="text-emerald-700 dark:text-emerald-400">Victoria</span>}
                  {h.won === false && <span className="text-[var(--muted)]">Derrota</span>}
                  {h.won === null && <span className="text-[var(--foreground)]">Empate</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p>
        <Link href="/posiciones" className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline">
          ← Volver a la tabla
        </Link>
      </p>
    </div>
  );
}
