"use client";

import { useActionState } from "react";
import { saveMatchScoreAction, type ActionResult } from "@/app/actions/fechas";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/ui/input-styles";
import { cn } from "@/lib/cn";

type Player = { id: string; name: string };

export type MatchScoreFormProps = {
  matchId: string;
  courtLabel: string | null;
  a1: Player;
  a2: Player;
  b1: Player;
  b2: Player;
  scoreTeamA: number | null;
  scoreTeamB: number | null;
};

const initial: ActionResult = {};

const scoreInputClass = cn(inputClassName, "w-16 px-2 py-1.5 text-center text-sm tabular-nums");

export function MatchScoreForm({
  matchId,
  courtLabel,
  a1,
  a2,
  b1,
  b2,
  scoreTeamA,
  scoreTeamB,
}: MatchScoreFormProps) {
  const [state, formAction, pending] = useActionState(saveMatchScoreAction, initial);

  return (
    <Card className="p-4">
      <form action={formAction}>
        <input type="hidden" name="matchId" value={matchId} />
        {courtLabel && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">{courtLabel}</p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">
              {a1.name} + {a2.name}
            </p>
            <p className="text-xs text-[var(--muted)]">vs</p>
            <p className="text-sm font-medium">
              {b1.name} + {b2.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor={`sa-${matchId}`}>
              Juegos equipo A
            </label>
            <input
              id={`sa-${matchId}`}
              name="scoreTeamA"
              type="number"
              min={0}
              max={99}
              required
              defaultValue={scoreTeamA ?? ""}
              placeholder="0"
              className={scoreInputClass}
            />
            <span className="text-[var(--muted)]">—</span>
            <label className="sr-only" htmlFor={`sb-${matchId}`}>
              Juegos equipo B
            </label>
            <input
              id={`sb-${matchId}`}
              name="scoreTeamB"
              type="number"
              min={0}
              max={99}
              required
              defaultValue={scoreTeamB ?? ""}
              placeholder="0"
              className={scoreInputClass}
            />
          </div>
        </div>
        {state.error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
            {state.error}
          </p>
        )}
        <Button type="submit" variant="outline" size="sm" disabled={pending} className="mt-3 w-full sm:w-auto">
          {pending ? "Guardando…" : "Guardar resultado"}
        </Button>
      </form>
    </Card>
  );
}
