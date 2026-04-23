"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { createManual1v1MatchAction, type ActionResult } from "@/app/actions/fechas";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/ui/input-styles";
import { estimate1v1WinProbability, formatPct, type PlayerStrengthInput } from "@/lib/match-probability";

export type Manual1v1User = { id: string; name: string };

export type Manual1v1MatchFormProps = {
  users: Manual1v1User[];
  statsByUserId: Record<string, PlayerStrengthInput>;
};

const initial: ActionResult = {};

function strengthFor(
  userId: string | undefined,
  statsByUserId: Record<string, PlayerStrengthInput>,
): PlayerStrengthInput {
  if (!userId) return { wins: 0, played: 0 };
  return statsByUserId[userId] ?? { wins: 0, played: 0 };
}

export function Manual1v1MatchForm({ users, statsByUserId }: Manual1v1MatchFormProps) {
  const [state, formAction, pending] = useActionState(createManual1v1MatchAction, initial);
  const [a1, setA1] = useState("");
  const [b1, setB1] = useState("");

  useEffect(() => {
    if (!state.ok) return;
    const t = window.setTimeout(() => {
      setA1("");
      setB1("");
    }, 0);
    return () => window.clearTimeout(t);
  }, [state.ok]);

  const estimate = useMemo(() => {
    if (!a1 || !b1 || a1 === b1) return null;
    return estimate1v1WinProbability(
      strengthFor(a1, statsByUserId),
      strengthFor(b1, statsByUserId),
    );
  }, [a1, b1, statsByUserId]);

  if (users.length < 2) {
    return (
      <Card className="p-4 sm:p-5">
        <h2 className="font-display text-2xl uppercase tracking-wide text-[var(--foreground)]">Partido 1v1</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Hacen falta al menos dos jugadores dados de alta para registrar un 1v1.
        </p>
      </Card>
    );
  }

  const selectClass = `${inputClassName} w-full`;

  return (
    <Card className="p-4 sm:p-5">
      <form action={formAction} className="space-y-4">
        <div>
          <h2 className="font-display text-2xl uppercase tracking-wide text-[var(--foreground)]">Partido 1v1</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Dos jugadores, sin parejas. El marcador (sets/juegos) es como siempre: lado A vs lado B.
          </p>
        </div>
        <div>
          <label htmlFor="manual-1v1-title" className="mb-1 block text-xs font-medium text-[var(--muted)]">
            Título (opcional)
          </label>
          <input
            id="manual-1v1-title"
            name="title"
            type="text"
            placeholder="Ej. Entrenamiento singles"
            className={inputClassName}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Jugador A</p>
            <label htmlFor="oneA1" className="mb-1 block text-xs font-medium text-[var(--muted)]">
              Nombre
            </label>
            <select
              id="oneA1"
              name="playerA1Id"
              required
              value={a1}
              onChange={(e) => setA1(e.target.value)}
              className={selectClass}
            >
              <option value="">Elegí…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Jugador B</p>
            <label htmlFor="oneB1" className="mb-1 block text-xs font-medium text-[var(--muted)]">
              Nombre
            </label>
            <select
              id="oneB1"
              name="playerB1Id"
              required
              value={b1}
              onChange={(e) => setB1(e.target.value)}
              className={selectClass}
            >
              <option value="">Elegí…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {estimate && (
          <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-muted)]/50 px-3 py-3 text-sm">
            <p className="font-medium text-[var(--foreground)]">Estimación orientativa</p>
            <p className="mt-1 text-[var(--muted)]">
              A ~{formatPct(estimate.teamA)} — B ~{formatPct(estimate.teamB)}. Basada en victorias y partidos recientes
              (promedio suavizado).
            </p>
          </div>
        )}

        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {state.error}
          </p>
        )}
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Creando…" : "Crear partido 1v1"}
        </Button>
      </form>
    </Card>
  );
}
