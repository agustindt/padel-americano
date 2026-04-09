import type { ReactNode } from "react";
import Link from "next/link";
import {
  ReglasIconFechas,
  ReglasIconMarcador,
  ReglasIconProbabilidad,
  ReglasIconPuntos,
  ReglasIconTabla,
} from "@/components/reglas-icons";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { getMinGamesForOfficialRanking } from "@/lib/ranking-config";

export const metadata = {
  title: "Reglas",
};

function SectionTitle({ id, icon, children }: { id: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="flex scroll-mt-28 items-start gap-3 font-display text-xl uppercase tracking-wide text-[var(--foreground)] sm:items-center sm:text-2xl"
    >
      {icon ? (
        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--accent)] sm:mt-0">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 leading-snug">{children}</span>
    </h2>
  );
}

/** Ejemplo al mejor de 3 sets (solo visual). */
function MatchSketch() {
  const sets = [
    { a: 6, b: 3 },
    { a: 3, b: 6 },
    { a: 6, b: 3 },
  ];
  return (
    <div className="space-y-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-muted)]/40 p-3" aria-hidden>
      <p className="text-center text-xs font-medium text-[var(--muted)]">Ejemplo: 2–1 en sets para el equipo A</p>
      {sets.map((s, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] bg-[var(--surface)] px-3 py-2 text-sm tabular-nums"
        >
          <span className="text-[var(--muted)]">Set {i + 1}</span>
          <span className="font-medium text-emerald-700 dark:text-emerald-400">{s.a}</span>
          <span className="text-[var(--muted)]">—</span>
          <span className="font-medium text-amber-800 dark:text-amber-300">{s.b}</span>
        </div>
      ))}
    </div>
  );
}

/** Flujo en SVG: datos → tabla (genérico). */
function FlowDiagram() {
  const fg = "var(--foreground)";
  const muted = "var(--muted)";
  const border = "var(--border)";
  const surfaceMuted = "var(--surface-muted)";
  return (
    <svg viewBox="0 0 520 120" className="h-auto w-full max-w-xl" aria-hidden>
      <defs>
        <marker id="reglas-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill={muted} />
        </marker>
      </defs>
      <rect x="8" y="28" width="120" height="64" rx="8" fill={surfaceMuted} stroke={border} strokeWidth="2" />
      <text x="68" y="52" textAnchor="middle" fill={fg} fontSize="11" fontWeight="600">
        Partidos
      </text>
      <text x="68" y="72" textAnchor="middle" fill={muted} fontSize="10">
        sets válidos
      </text>
      <line
        x1="136"
        y1="60"
        x2="188"
        y2="60"
        stroke={muted}
        strokeWidth="2"
        markerEnd="url(#reglas-arrow)"
      />
      <rect
        x="196"
        y="28"
        width="120"
        height="64"
        rx="8"
        fill="color-mix(in oklab, var(--accent) 18%, transparent)"
        stroke="var(--accent)"
        strokeWidth="2"
      />
      <text x="256" y="56" textAnchor="middle" fill={fg} fontSize="11" fontWeight="600">
        Reglas de
      </text>
      <text x="256" y="74" textAnchor="middle" fill={fg} fontSize="11" fontWeight="600">
        puntos
      </text>
      <line
        x1="324"
        y1="60"
        x2="376"
        y2="60"
        stroke={muted}
        strokeWidth="2"
        markerEnd="url(#reglas-arrow)"
      />
      <rect x="384" y="28" width="128" height="64" rx="8" fill={surfaceMuted} stroke={border} strokeWidth="2" />
      <text x="448" y="60" textAnchor="middle" fill={fg} fontSize="11" fontWeight="600">
        Tabla
      </text>
    </svg>
  );
}

/** Ejemplo ilustrativo de barras % (no datos reales). */
function WinRateIllustration() {
  const bars = [
    { label: "Jug. A", pct: 72, w: "w-[72%]" },
    { label: "Jug. B", pct: 58, w: "w-[58%]" },
    { label: "Jug. C", pct: 45, w: "w-[45%]" },
  ];
  return (
    <div className="space-y-3" aria-hidden>
      <p className="text-xs text-[var(--muted)]">Ejemplo visual del concepto de % victorias (datos ficticios).</p>
      {bars.map((b) => (
        <div key={b.label} className="flex items-center gap-3 text-sm">
          <span className="w-16 shrink-0 text-[var(--muted)]">{b.label}</span>
          <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <div
              className={`h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] ${b.w}`}
            />
          </div>
          <span className="w-10 shrink-0 tabular-nums text-right font-medium text-[var(--foreground)]">{b.pct}%</span>
        </div>
      ))}
    </div>
  );
}

export default function ReglasPage() {
  const minGames = getMinGamesForOfficialRanking();

  return (
    <div className="space-y-10">
      <PageHeader
        title="Reglas y cómo funciona"
        description="Los partidos se cargan set por set (mejor de tres en la cancha: quien gana 2 sets se lleva el partido). La tabla usa solo ese resultado final del partido — victoria, empate o derrota — no cada set por separado."
      />

      <nav className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-muted)]/40 p-3 text-sm">
        <p className="mb-2 font-medium text-[var(--foreground)]">En esta página</p>
        <ol className="list-inside list-decimal space-y-1 text-[var(--muted)]">
          <li>
            <a href="#puntos" className="text-[var(--accent)] underline-offset-2 hover:underline">
              Puntos por resultado
            </a>
          </li>
          <li>
            <a href="#marcador" className="text-[var(--accent)] underline-offset-2 hover:underline">
              Sets y marcador (mejor de tres)
            </a>
          </li>
          <li>
            <a href="#tabla" className="text-[var(--accent)] underline-offset-2 hover:underline">
              Tabla y ranking
            </a>
          </li>
          <li>
            <a href="#fechas" className="text-[var(--accent)] underline-offset-2 hover:underline">
              Tipos de fecha
            </a>
          </li>
          <li>
            <a href="#probabilidad" className="text-[var(--accent)] underline-offset-2 hover:underline">
              Estimación de probabilidad
            </a>
          </li>
        </ol>
      </nav>

      <section className="space-y-4" aria-labelledby="puntos">
        <SectionTitle id="puntos" icon={<ReglasIconPuntos />}>
          Puntos por resultado
        </SectionTitle>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Cada jugador suma según el <strong className="text-[var(--foreground)]">resultado del partido</strong>: al
          mejor de tres, gana el equipo que primero llega a <strong className="text-[var(--foreground)]">2 sets</strong>{" "}
          (ej. 6–3, 3–6, 6–3). Si solo cargás <strong className="text-[var(--foreground)]">un set</strong>, ese set
          define el partido entero (como un partido de un solo set). Los puntos no se reparten por set: es una victoria,
          empate o derrota por partido.
        </p>
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]/60 text-[var(--muted)]">
                  <th className="px-4 py-3 font-medium">Resultado del partido</th>
                  <th className="px-4 py-3 text-center font-medium">Pts por jugador</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                <tr className="border-b border-[var(--border)]">
                  <td className="px-4 py-3">
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">Victoria</span> (tu equipo ganó
                    el partido: 2–0 o 2–1 en sets, o ganó el único set cargado)
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-[var(--foreground)]">3</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="px-4 py-3">
                    <span className="font-medium text-[var(--foreground)]">Empate</span> (solo si cargaste{" "}
                    <strong className="text-[var(--foreground)]">un</strong> set y quedó igual en juegos, ej. 6–6 con
                    desempate pendiente — caso raro)
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-[var(--foreground)]">1</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <span className="font-medium text-[var(--muted)]">Derrota</span> (tu equipo perdió el partido)
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-[var(--foreground)]">0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--muted)]">
          En la tabla verás <strong className="text-[var(--foreground)]">PJ</strong> (partidos cerrados),{" "}
          <strong className="text-[var(--foreground)]">G / P / E</strong> y los puntos totales — siempre a nivel{" "}
          <strong className="text-[var(--foreground)]">partido</strong>, no por cantidad de sets ganados.
        </p>
      </section>

      <section className="space-y-4" aria-labelledby="marcador">
        <SectionTitle id="marcador" icon={<ReglasIconMarcador />}>
          Sets y marcador (mejor de tres)
        </SectionTitle>
        <Card className="space-y-4 p-4 sm:p-5">
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            En <strong className="text-[var(--foreground)]">Fechas</strong> cargás cada set como juegos a favor del equipo
            A y del equipo B (como en la cancha: 6–3, 3–6, 6–3, etc.). Las filas vacías se ignoran. Podés sumar o quitar
            filas si hace falta.
          </p>
          <ul className="list-inside list-disc space-y-1.5 text-sm text-[var(--muted)]">
            <li>
              <strong className="text-[var(--foreground)]">Partido al mejor de tres:</strong> tiene que quedar definido un
              ganador: el primero que gana <strong className="text-[var(--foreground)]">2 sets</strong> (2–0 o 2–1 en
              sets).
            </li>
            <li>
              Si después de dos sets va <strong className="text-[var(--foreground)]">1–1</strong> en sets, falta cargar el
              tercer set; la app no guarda un partido incompleto.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Solo un set:</strong> si jugaron un solo set y listo, cargás
              una fila — ese resultado cuenta como el partido entero (útil si el grupo a veces juega un set rápido).
            </li>
          </ul>
          <MatchSketch />
          <p className="text-center text-xs text-[var(--muted)]">
            Ejemplo: 6–3, 3–6 y 6–3 → equipo A gana el partido 2–1 en sets; los cuatro jugadores suman como una victoria
            o derrota de partido, no tres resultados distintos.
          </p>
          <div className="rounded-[var(--radius-sm)] border border-amber-500/35 bg-amber-500/10 px-3 py-3 text-sm text-[var(--foreground)]">
            <strong>Importante:</strong> un set en <span className="tabular-nums font-semibold">0–0</span> no cuenta. Si
            cargás más de un set, cada set cargado tiene que tener un ganador (no empates tipo 6–6 sin desempate). Cuando
            termine cada set, anotá los juegos reales (6–4, 7–5, etc.).
          </div>
        </Card>
      </section>

      <section className="space-y-4" aria-labelledby="tabla">
        <SectionTitle id="tabla" icon={<ReglasIconTabla />}>
          Tabla y ranking justo
        </SectionTitle>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          La app ordena primero a quienes tienen volumen suficiente de partidos; así nadie queda primero solo por haber
          ganado 1 de 1 mientras otros llevan muchos partidos jugados.
        </p>
        <Card className="space-y-4 p-4 sm:p-5">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Cómo se ordena</h3>
            <ol className="list-inside list-decimal space-y-2 text-sm text-[var(--muted)]">
              <li>
                Quienes jugaron al menos <strong className="text-[var(--foreground)]">{minGames} partidos (PJ)</strong>{" "}
                forman el bloque principal, ordenados por <strong className="text-[var(--foreground)]">% de victorias</strong>{" "}
                (G ÷ PJ), luego por victorias, partidos jugados y puntos.
              </li>
              <li>
                El resto aparece <strong className="text-[var(--foreground)]">debajo</strong> hasta alcanzar ese mínimo
                (por trabajo, lesión o fechas al aire).
              </li>
            </ol>
            <p className="text-xs text-[var(--muted)]">
              Podés cambiar el mínimo con la variable{" "}
              <code className="rounded bg-[var(--surface-muted)] px-1 py-0.5 text-[var(--foreground)]">
                NEXT_PUBLIC_MIN_GAMES_FOR_RANKING
              </code>{" "}
              (por defecto {minGames}).
            </p>
          </div>
          <WinRateIllustration />
        </Card>
        <Card className="p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">De dónde salen los números</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Solo entran partidos con sets válidos y partido <strong className="text-[var(--foreground)]">cerrado</strong>{" "}
            (ganador claro al mejor de tres, o un solo set cargado). El flujo es:
          </p>
          <div className="mt-4">
            <FlowDiagram />
          </div>
        </Card>
      </section>

      <section className="space-y-4" aria-labelledby="fechas">
        <SectionTitle id="fechas" icon={<ReglasIconFechas />}>
          Tipos de fecha
        </SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="flex flex-col p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Fecha con sorteo</p>
            <h3 className="mt-2 font-display text-lg uppercase tracking-wide text-[var(--foreground)]">Americano</h3>
            <p className="mt-2 flex-1 text-sm text-[var(--muted)]">
              Se sortean parejas entre todos los jugadores dados de alta. Si no cierran grupos de 4, quienes sobran{" "}
              <strong className="text-[var(--foreground)]">descansan</strong> esa fecha (no juegan ni suman).
            </p>
            <ul className="mt-3 space-y-1 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
              <li>· Varios partidos según cantidad de jugadores</li>
              <li>· Cruces automáticos en canchas</li>
            </ul>
          </Card>
          <Card className="flex flex-col border-[var(--accent-muted)]/40 p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Sin sorteo masivo</p>
            <h3 className="mt-2 font-display text-lg uppercase tracking-wide text-[var(--foreground)]">Partido manual</h3>
            <p className="mt-2 flex-1 text-sm text-[var(--muted)]">
              Elegís exactamente cuatro jugadores (dos parejas). Sirve cuando ya arreglaron el cruce por WhatsApp y solo
              quieren registrarlo y sumarlo en la tabla.
            </p>
            <ul className="mt-3 space-y-1 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
              <li>· Un solo partido por “fecha” manual</li>
              <li>· Mismo sistema de puntos al cargar el resultado</li>
            </ul>
          </Card>
        </div>
        <Card className="p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Estado de cada fecha</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            <strong className="text-[var(--foreground)]">Borrador</strong> es tentativa: esos partidos{" "}
            <strong className="text-[var(--foreground)]">no suman en la tabla</strong> ni entran al calendario .ics.{" "}
            <strong className="text-[var(--foreground)]">Confirmada</strong> cuenta para la tabla y puede aparecer en el
            calendario si tiene día y hora. <strong className="text-[var(--foreground)]">Jugada</strong> marca la fecha
            como cerrada a nivel organización (los resultados siguen siendo los sets cargados).
          </p>
        </Card>
      </section>

      <section className="space-y-4" aria-labelledby="probabilidad">
        <SectionTitle id="probabilidad" icon={<ReglasIconProbabilidad />}>
          Estimación de probabilidad (partido manual)
        </SectionTitle>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Al armar un partido manual, la app muestra un porcentaje <strong className="text-[var(--foreground)]">orientativo</strong>{" "}
          de chances por equipo. No predice el día del clima: solo resume el historial reciente de victorias y partidos
          jugados de cada uno.
        </p>
        <Card className="space-y-3 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Idea en dos pasos</h3>
          <ol className="list-inside list-decimal space-y-2 text-sm text-[var(--muted)]">
            <li>
              Por jugador: fuerza suavizada{" "}
              <code className="whitespace-nowrap rounded bg-[var(--surface-muted)] px-1.5 py-0.5 text-xs text-[var(--foreground)]">
                (victorias + 1) ÷ (partidos + 2)
              </code>{" "}
              para no inflar a quien tiene pocos partidos.
            </li>
            <li>
              Se promedian las dos fuerzas de cada equipo y se convierte en probabilidad:{" "}
              <code className="whitespace-nowrap rounded bg-[var(--surface-muted)] px-1.5 py-0.5 text-xs text-[var(--foreground)]">
                P(A) = fuerza A ÷ (fuerza A + fuerza B)
              </code>
              .
            </li>
          </ol>
          <p className="text-xs text-[var(--muted)]">
            Si no hay datos, los valores se acercan a un reparto parejo. Usalo como charla de club, no como apuesta
            cerrada.
          </p>
        </Card>
      </section>

      <Card className="border-[var(--accent-muted)]/30 bg-[var(--surface-muted)]/30 p-4 sm:p-5">
        <p className="text-sm text-[var(--muted)]">
          ¿Listo para jugar?{" "}
          <Link href="/fechas" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
            Ir a fechas
          </Link>{" "}
          o{" "}
          <Link href="/posiciones" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
            ver la tabla
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
