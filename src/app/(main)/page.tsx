import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { computeStandings } from "@/lib/standings";
import { prisma } from "@/lib/prisma";
import { formatRoundDateTimeLong } from "@/lib/datetime";
import { BRAND_TAGLINE } from "@/lib/brand";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const groupId = session?.user?.groupId;
  if (!groupId) {
    redirect("/login");
  }

  const now = new Date();
  const [standings, userCount, roundCount, upcoming] = await Promise.all([
    computeStandings(groupId),
    prisma.user.count({ where: { groupId } }),
    prisma.round.count({ where: { groupId } }),
    prisma.round.findFirst({
      where: {
        groupId,
        scheduledAt: { gte: now },
        status: { in: ["CONFIRMED", "PLAYED"] },
      },
      orderBy: { scheduledAt: "asc" },
    }),
  ]);

  const leader = standings[0];

  return (
    <div className="space-y-10">
      <PageHeader
        title={`Hola${session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}`}
        description={BRAND_TAGLINE + ". Si alguien falta una fecha, no juega esa ronda y no suma puntos."}
      />

      {upcoming && (
        <Card className="border-[var(--accent-muted)]/50 bg-[var(--surface)] p-4 shadow-[var(--shadow-md)] sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
            Próxima fecha
          </p>
          <h2 className="mt-1 break-words font-display text-2xl uppercase tracking-wide text-[var(--foreground)]">
            {upcoming.title ?? `Fecha ${upcoming.sortOrder}`}
          </h2>
          {upcoming.scheduledAt && (
            <p className="mt-2 text-sm text-[var(--muted)]">
              {formatRoundDateTimeLong(upcoming.scheduledAt)}
            </p>
          )}
          {upcoming.venue && (
            <p className="mt-2 break-words text-sm font-medium text-[var(--foreground)]">{upcoming.venue}</p>
          )}
          {upcoming.mapsUrl && (
            <a
              href={upcoming.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 touch-manipulation items-center text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            >
              Cómo llegar (mapa)
            </a>
          )}
          <div className="mt-4">
            <Link
              href="/fechas"
              className="text-sm font-medium text-[var(--accent-strong)] underline-offset-2 hover:underline"
            >
              Ver todos los cruces →
            </Link>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/posiciones" className="group block touch-manipulation active:scale-[0.99]">
          <Card className="h-full p-4 transition group-hover:border-[var(--accent)] group-hover:shadow-[var(--shadow-md)] sm:p-5">
            <h2 className="font-display text-2xl uppercase tracking-wide text-[var(--accent-strong)] group-hover:text-[var(--accent)]">
              Tabla
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {userCount} jugador{userCount !== 1 ? "es" : ""} · 3 pts victoria, 1 empate
            </p>
            {leader && userCount > 0 && (
              <p className="mt-4 text-sm">
                Líder:{" "}
                <span className="font-semibold text-[var(--foreground)]">{leader.name}</span> ({leader.points}{" "}
                pts)
              </p>
            )}
          </Card>
        </Link>
        <Link href="/fechas" className="group block touch-manipulation active:scale-[0.99]">
          <Card className="h-full p-4 transition group-hover:border-[var(--accent)] group-hover:shadow-[var(--shadow-md)] sm:p-5">
            <h2 className="font-display text-2xl uppercase tracking-wide text-[var(--accent-strong)] group-hover:text-[var(--accent)]">
              Fechas
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {roundCount} fecha{roundCount !== 1 ? "s" : ""} · sorteo aleatorio de parejas
            </p>
          </Card>
        </Link>
      </div>

      <Link href="/reglas" className="group block touch-manipulation active:scale-[0.99]">
        <Card className="border-[var(--accent-muted)]/35 bg-[var(--surface-muted)]/40 p-4 transition group-hover:border-[var(--accent)] group-hover:shadow-[var(--shadow-md)] sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl uppercase tracking-wide text-[var(--accent-strong)] group-hover:text-[var(--accent)]">
                Reglas
              </h2>
              <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
                Puntos, tabla, fechas manuales y cómo lee la app el marcador — explicado con tablas y diagramas.
              </p>
            </div>
            <span className="shrink-0 text-sm font-medium text-[var(--accent)] group-hover:underline sm:pr-2">
              Ver todo →
            </span>
          </div>
        </Card>
      </Link>
    </div>
  );
}
