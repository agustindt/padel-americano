"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { deleteMatchAction, saveMatchScoreAction, type ActionResult } from "@/app/actions/fechas";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/ui/input-styles";
import { cn } from "@/lib/cn";
import {
  formatSetsDisplay,
  MAX_SETS,
  verdictFromSets,
  type GameSet,
} from "@/lib/match-sets";

type Player = { id: string; name: string };

type Row = { a: string; b: string };

export type MatchScoreFormProps = {
  matchId: string;
  courtLabel: string | null;
  a1: Player;
  /** null en partido 1v1 */
  a2: Player | null;
  b1: Player;
  b2: Player | null;
  /** true cuando no hay pareja (1v1) */
  singles: boolean;
  /** null si todavía no hay resultado guardado */
  setScores: GameSet[] | null;
};

const initial: ActionResult = {};

const scoreInputClass = cn(
  inputClassName,
  "w-[4.25rem] max-w-full px-2 py-2 text-center text-base tabular-nums sm:w-16 sm:py-1.5 sm:text-sm",
);

function rowsFromSets(sets: GameSet[] | null): Row[] {
  if (sets && sets.length > 0) {
    return sets.map((s) => ({ a: String(s.a), b: String(s.b) }));
  }
  return [
    { a: "", b: "" },
    { a: "", b: "" },
    { a: "", b: "" },
  ];
}

function buildSetsFromRows(rows: Row[]): GameSet[] | { error: string } {
  const out: GameSet[] = [];
  for (const row of rows) {
    const ta = row.a.trim();
    const tb = row.b.trim();
    if (ta === "" && tb === "") continue;
    if (ta === "" || tb === "") {
      return { error: "Completá ambos lados en cada set que empezaste." };
    }
    const a = Number.parseInt(ta, 10);
    const b = Number.parseInt(tb, 10);
    if (Number.isNaN(a) || Number.isNaN(b)) {
      return { error: "Los juegos de cada set tienen que ser números." };
    }
    out.push({ a, b });
  }
  return out;
}

export function MatchScoreForm({
  matchId,
  courtLabel,
  a1,
  a2,
  b1,
  b2,
  singles,
  setScores: initialSetScores,
}: MatchScoreFormProps) {
  const [state, saveAction, savePending] = useActionState(saveMatchScoreAction, initial);
  const [delState, deleteAction, deletePending] = useActionState(deleteMatchAction, initial);
  const [rows, setRows] = useState<Row[]>(() => rowsFromSets(initialSetScores));
  const saveCycle = useRef(false);

  useEffect(() => {
    if (savePending) {
      saveCycle.current = true;
      return;
    }
    if (saveCycle.current) {
      if (state.ok) {
        toast.success("Resultado guardado");
      }
      saveCycle.current = false;
    }
  }, [savePending, state]);

  const setsJson = useMemo(() => {
    const built = buildSetsFromRows(rows);
    if ("error" in built) return "[]";
    return JSON.stringify(built);
  }, [rows]);

  const clientPreview = useMemo(() => {
    const built = buildSetsFromRows(rows);
    if ("error" in built || built.length === 0) return null;
    return verdictFromSets(built);
  }, [rows]);

  const hasSavedScore =
    initialSetScores != null &&
    initialSetScores.length > 0 &&
    verdictFromSets(initialSetScores).kind === "counted";

  const summaryLine =
    initialSetScores && initialSetScores.length > 0 ? formatSetsDisplay(initialSetScores) : null;

  return (
    <Card className="p-4">
      <form action={saveAction}>
        <input type="hidden" name="matchId" value={matchId} />
        <input type="hidden" name="setsJson" value={setsJson} />

        {courtLabel && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">{courtLabel}</p>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-base font-medium leading-snug sm:text-sm">
              {singles ? (
                <span className="break-words">{a1.name}</span>
              ) : (
                <>
                  <span className="break-words">{a1.name}</span> +{" "}
                  <span className="break-words">{a2?.name ?? ""}</span>
                </>
              )}
            </p>
            <p className="text-xs text-[var(--muted)]">vs</p>
            <p className="text-base font-medium leading-snug sm:text-sm">
              {singles ? (
                <span className="break-words">{b1.name}</span>
              ) : (
                <>
                  <span className="break-words">{b1.name}</span> +{" "}
                  <span className="break-words">{b2?.name ?? ""}</span>
                </>
              )}
            </p>
            {summaryLine && (
              <p className="mt-2 text-xs font-medium text-[var(--foreground)]">Guardado: {summaryLine}</p>
            )}
          </div>

          <div className="w-full min-w-0 sm:max-w-md">
            <p className="mb-2 text-xs font-medium text-[var(--muted)]">Al mejor de tres sets (podés cargar 1, 2 o 3)</p>
            <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2 text-xs text-[var(--muted)] sm:text-sm">
              <span className="w-14 shrink-0" />
              <span className="flex-1 text-center">{singles ? "Lado A" : "Equipo A"}</span>
              <span className="w-6 shrink-0" />
              <span className="flex-1 text-center">{singles ? "Lado B" : "Equipo B"}</span>
            </div>
            <div className="space-y-2">
              {rows.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-14 shrink-0 text-xs text-[var(--muted)]">Set {i + 1}</span>
                  <label className="sr-only" htmlFor={`${matchId}-a-${i}`}>
                    Juegos equipo A set {i + 1}
                  </label>
                  <input
                    id={`${matchId}-a-${i}`}
                    type="number"
                    min={0}
                    max={99}
                    value={row.a}
                    onChange={(e) => {
                      const next = [...rows];
                      next[i] = { ...next[i], a: e.target.value };
                      setRows(next);
                    }}
                    placeholder="0"
                    className={cn(scoreInputClass, "flex-1")}
                  />
                  <span className="w-6 shrink-0 text-center text-[var(--muted)]">—</span>
                  <label className="sr-only" htmlFor={`${matchId}-b-${i}`}>
                    Juegos equipo B set {i + 1}
                  </label>
                  <input
                    id={`${matchId}-b-${i}`}
                    type="number"
                    min={0}
                    max={99}
                    value={row.b}
                    onChange={(e) => {
                      const next = [...rows];
                      next[i] = { ...next[i], b: e.target.value };
                      setRows(next);
                    }}
                    placeholder="0"
                    className={cn(scoreInputClass, "flex-1")}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {rows.length < MAX_SETS && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setRows((r) => [...r, { a: "", b: "" }])}
                >
                  + Agregar set
                </Button>
              )}
              {rows.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-[var(--muted)]"
                  onClick={() => setRows((r) => r.slice(0, -1))}
                >
                  Quitar último set
                </Button>
              )}
            </div>
            {clientPreview && clientPreview.kind === "incomplete" && (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">{clientPreview.message}</p>
            )}
            {clientPreview && clientPreview.kind === "counted" && clientPreview.draw && (
              <p className="mt-2 text-xs font-medium text-[var(--foreground)]">
                Resultado: empate a nivel partido (1 pt cada bando al guardar).
              </p>
            )}
            {clientPreview && clientPreview.kind === "invalid" && rows.some((r) => r.a.trim() || r.b.trim()) && (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">{clientPreview.message}</p>
            )}
          </div>
        </div>

        <p className="mt-4 text-xs text-[var(--muted)]">
          Los sets en blanco se ignoran. Gana el partido el primero con 2 sets ganados, o un solo set si solo jugaron una
          manga. Los sets con el mismo juego a ambos lados (6–6, etc.) son empate de set y permiten dejar el partido
          empatado en los casos de las reglas. Si va 1–1 en sets, falta un tercer set o un cierre con empate.
          {hasSavedScore && (
            <span className="mt-1 block">
              Podés <strong className="font-medium text-[var(--foreground)]">cambiar los sets</strong> y volver a guardar.
            </span>
          )}
        </p>
        <div aria-live="assertive" className="mt-2 min-h-0 space-y-1">
          {state.error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {state.error}
            </p>
          )}
          {delState.error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {delState.error}
            </p>
          )}
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:mt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Button
            type="submit"
            variant="outline"
            size="md"
            disabled={savePending || deletePending}
            className="w-full sm:w-auto sm:text-sm"
          >
            {savePending ? "Guardando…" : hasSavedScore ? "Actualizar resultado" : "Guardar resultado"}
          </Button>
          <Button
            type="submit"
            formAction={deleteAction}
            formNoValidate
            variant="outline"
            size="md"
            disabled={savePending || deletePending}
            className="w-full border-red-600 text-red-900 shadow-sm hover:bg-red-500/15 dark:border-red-500 dark:text-red-100 dark:hover:bg-red-950/60 sm:w-auto sm:text-sm"
            onClick={(e) => {
              if (
                !confirm(
                  "¿Eliminar este partido? La tabla se recalcula sin este resultado. Si era la única fecha manual, también se quita la fecha vacía.",
                )
              ) {
                e.preventDefault();
              }
            }}
          >
            {deletePending ? "Eliminando…" : "Eliminar partido"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
