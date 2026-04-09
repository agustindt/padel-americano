"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { createManualMatchAction, type ActionResult } from "@/app/actions/fechas";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/ui/input-styles";
import {
  estimateTeamWinProbability,
  formatPct,
  type PlayerStrengthInput,
} from "@/lib/match-probability";

export type ManualMatchUser = { id: string; name: string };

export type ManualMatchFormProps = {
  users: ManualMatchUser[];
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

export function ManualMatchForm({ users, statsByUserId }: ManualMatchFormProps) {
  const [state, formAction, pending] = useActionState(createManualMatchAction, initial);
  const [a1, setA1] = useState("");
  const [a2, setA2] = useState("");
  const [b1, setB1] = useState("");
  const [b2, setB2] = useState("");

  useEffect(() => {
    if (state.ok) {
      setA1("");
      setA2("");
      setB1("");
      setB2("");
    }
  }, [state.ok]);

  const estimate = useMemo(() => {
    const ids = [a1, a2, b1, b2];
    if (ids.some((id) => !id) || new Set(ids).size !== 4) return null;
    return estimateTeamWinProbability(
      strengthFor(a1, statsByUserId),
      strengthFor(a2, statsByUserId),
      strengthFor(b1, statsByUserId),
      strengthFor(b2, statsByUserId),
    );
  }, [a1, a2, b1, b2, statsByUserId]);

  if (users.length < 4) {
    return (
      <Card className="p-4 sm:p-5">
        <h2 className="font-display text-2xl uppercase tracking-wide text-[var(--foreground)]">Partido manual</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Hacen falta al menos cuatro jugadores dados de alta para armar un partido sin sorteo.
        </p>
      </Card>
    );
  }

  const selectClass = `${inputClassName} w-full`;

  return (
    <Card className="p-4 sm:p-5">
      <form action={formAction} className="space-y-4">
        <div>
          <h2 className="font-display text-2xl uppercase tracking-wide text-[var(--foreground)]">Partido manual</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Elegí dos parejas (cuatro jugadores distintos). No se sortea el resto del grupo: solo este cruce. Podés cargar
            el resultado abajo cuando termine.
          </p>
        </div>
        <div>
          <label htmlFor="manual-title" className="mb-1 block text-xs font-medium text-[var(--muted)]">
            Título (opcional)
          </label>
          <input
            id="manual-title"
            name="title"
            type="text"
            placeholder="Ej. Sábado WhatsApp"
            className={inputClassName}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Equipo A</p>
            <div>
              <label htmlFor="playerA1Id" className="mb-1 block text-xs font-medium text-[var(--muted)]">
                Jugador 1
              </label>
              <select
                id="playerA1Id"
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
              <label htmlFor="playerA2Id" className="mb-1 block text-xs font-medium text-[var(--muted)]">
                Jugador 2
              </label>
              <select
                id="playerA2Id"
                name="playerA2Id"
                required
                value={a2}
                onChange={(e) => setA2(e.target.value)}
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
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Equipo B</p>
            <div>
              <label htmlFor="playerB1Id" className="mb-1 block text-xs font-medium text-[var(--muted)]">
                Jugador 1
              </label>
              <select
                id="playerB1Id"
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
            <div>
              <label htmlFor="playerB2Id" className="mb-1 block text-xs font-medium text-[var(--muted)]">
                Jugador 2
              </label>
              <select
                id="playerB2Id"
                name="playerB2Id"
                required
                value={b2}
                onChange={(e) => setB2(e.target.value)}
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
        </div>

        {estimate && (
          <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-muted)]/50 px-3 py-3 text-sm">
            <p className="font-medium text-[var(--foreground)]">Estimación orientativa</p>
            <p className="mt-1 text-[var(--muted)]">
              Equipo A ~{formatPct(estimate.teamA)} — Equipo B ~{formatPct(estimate.teamB)}. Basada en victorias y partidos
              jugados recientes (promedio suavizado por jugador).
            </p>
          </div>
        )}

        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {state.error}
          </p>
        )}
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Creando…" : "Crear partido"}
        </Button>
      </form>
    </Card>
  );
}
