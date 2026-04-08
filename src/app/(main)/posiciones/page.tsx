import { computeStandings } from "@/lib/standings";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tabla",
};

export default async function PosicionesPage() {
  const [standings, userCount] = await Promise.all([computeStandings(), prisma.user.count()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tabla de posiciones"
        description="Solo cuentan partidos con resultado cargado. Sistema: 3 puntos por victoria, 1 por empate, 0 por derrota."
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]/50 text-[var(--muted)]">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Jugador</th>
                  <th className="px-4 py-3 font-medium text-center">PJ</th>
                  <th className="px-4 py-3 font-medium text-center">G</th>
                  <th className="px-4 py-3 font-medium text-center">P</th>
                  <th className="px-4 py-3 font-medium text-center">E</th>
                  <th className="px-4 py-3 font-medium text-right">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row, i) => (
                  <tr
                    key={row.userId}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)]"
                  >
                    <td className="px-4 py-3 text-[var(--muted)]">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-center tabular-nums">{row.played}</td>
                    <td className="px-4 py-3 text-center tabular-nums text-emerald-700 dark:text-emerald-400">
                      {row.wins}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-[var(--muted)]">{row.losses}</td>
                    <td className="px-4 py-3 text-center tabular-nums">{row.draws}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">{row.points}</td>
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
