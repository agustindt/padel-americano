"use client";

import { useActionState } from "react";
import { createRoundAction, type ActionResult } from "@/app/actions/fechas";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/ui/input-styles";

const initial: ActionResult = {};

export function CreateRoundForm() {
  const [state, formAction, pending] = useActionState(createRoundAction, initial);

  return (
    <Card className="p-4 sm:p-5">
      <form action={formAction} className="space-y-4">
        <div>
          <h2 className="font-display text-2xl uppercase tracking-wide text-[var(--foreground)]">Nueva fecha</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Se sortean parejas y cruces al azar entre todos los jugadores dados de alta. Quienes sobran (menos de 4
            en el último grupo) descansan esa fecha.
          </p>
        </div>
        <div>
          <label htmlFor="title" className="mb-1 block text-xs font-medium text-[var(--muted)]">
            Título (opcional)
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Ej. Sábado cancha Norte"
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="scheduledAt" className="mb-1 block text-xs font-medium text-[var(--muted)]">
            Día y hora (opcional)
          </label>
          <input id="scheduledAt" name="scheduledAt" type="datetime-local" className={inputClassName} />
        </div>
        <div>
          <label htmlFor="venue" className="mb-1 block text-xs font-medium text-[var(--muted)]">
            Lugar / cancha (opcional)
          </label>
          <input
            id="venue"
            name="venue"
            type="text"
            placeholder="Ej. Club Los Pinos — cancha 2"
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="mapsUrl" className="mb-1 block text-xs font-medium text-[var(--muted)]">
            Enlace a mapa (opcional)
          </label>
          <input
            id="mapsUrl"
            name="mapsUrl"
            type="url"
            placeholder="https://maps.google.com/..."
            className={inputClassName}
          />
        </div>
        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {state.error}
          </p>
        )}
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Sorteando…" : "Crear fecha y cruces"}
        </Button>
      </form>
    </Card>
  );
}
