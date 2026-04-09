import { computeStandings } from "@/lib/standings";
import { getMinGamesForOfficialRanking } from "@/lib/ranking-config";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tabla",
};

function formatWinRate(winRate: number | null, played: number): string {
  if (played === 0 || winRate === null) return "—";
  return `${Math.round(winRate * 100)}%`;
}

export default async function PosicionesPage() {
  const [standings, userCount] = await Promise.all([computeStandings(), prisma.user.count()]);
  const minGames = getMinGamesForOfficialRanking();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tabla de posiciones"
        description={`Solo cuentan partidos con resultado cargado; el marcador 0–0 no suma (hay que cargar el resultado real). Sistema: 3 puntos por victoria, 1 por empate, 0 por derrota. El orden prioriza el porcentaje de victorias entre quienes jugó al menos ${minGames} partidos; quienes tienen menos partidos aparecen abajo hasta alcanzar ese mínimo, para que un récord corto no adelante a quien lleva más volumen.`}
      />

      {userCount === 0 ? (
        <EmptyState
          emoji="🎾"
          title="Todavía no hay jugadores"
          description="Registrate con tus amigos para ver la tabla y empezar a sumar puntos en el americano."
        >
          <Link
            href="/register"
            className="text-sm font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Crear cuenta →
          </Link>
        </EmptyState>
      ) : (
        <Card className="overflow-hidden">
          <div className="-mx-4 overflow-x-auto overscroll-x-contain px-4 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:px-0">
            <table className="w-full min-w-[320px] text-left text-sm sm:min-w-[420px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]/50 text-[var(--muted)]">
                  <th className="whitespace-nowrap px-3 py-3 text-xs font-medium sm:px-4 sm:text-sm">#</th>
                  <th className="min-w-[6rem] px-3 py-3 text-xs font-medium sm:px-4 sm:text-sm">Jugador</th>
                  <th className="whitespace-nowrap px-2 py-3 text-center text-xs font-medium sm:px-4 sm:text-sm">
                    PJ
                  </th>
                  <th className="whitespace-nowrap px-2 py-3 text-center text-xs font-medium sm:px-4 sm:text-sm">
                    % vic.
                  </th>
                  <th className="whitespace-nowrap px-2 py-3 text-center text-xs font-medium sm:px-4 sm:text-sm">
                    G
                  </th>
                  <th className="whitespace-nowrap px-2 py-3 text-center text-xs font-medium sm:px-4 sm:text-sm">
                    P
                  </th>
                  <th className="whitespace-nowrap px-2 py-3 text-center text-xs font-medium sm:px-4 sm:text-sm">
                    E
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-right text-xs font-medium sm:px-4 sm:text-sm">
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row, i) => (
                  <tr
                    key={row.userId}
                    className={
                      row.meetsMinimumGames
                        ? "border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)]"
                        : "border-b border-[var(--border)] bg-[var(--surface-muted)]/25 last:border-0 hover:bg-[var(--surface-hover)]"
                    }
                  >
                    <td className="px-3 py-3 text-[var(--muted)] sm:px-4">{i + 1}</td>
                    <td className="min-w-0 max-w-[42vw] px-3 py-3 font-medium break-words sm:max-w-none sm:px-4">
                      <span className="align-middle">{row.name}</span>
                      {!row.meetsMinimumGames && row.played > 0 && (
                        <span className="mt-0.5 block text-xs font-normal text-[var(--muted)]">
                          Menos de {minGames} PJ (fuera del bloque principal)
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3 text-center tabular-nums sm:px-4">{row.played}</td>
                    <td className="px-2 py-3 text-center tabular-nums font-medium sm:px-4">
                      {formatWinRate(row.winRate, row.played)}
                    </td>
                    <td className="px-2 py-3 text-center tabular-nums text-emerald-700 dark:text-emerald-400 sm:px-4">
                      {row.wins}
                    </td>
                    <td className="px-2 py-3 text-center tabular-nums text-[var(--muted)] sm:px-4">{row.losses}</td>
                    <td className="px-2 py-3 text-center tabular-nums sm:px-4">{row.draws}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold sm:px-4">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
