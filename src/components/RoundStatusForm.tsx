"use client";

import { useActionState } from "react";
import { updateRoundStatusAction, type ActionResult } from "@/app/actions/fechas";
import { inputClassName } from "@/components/ui/input-styles";

const initial: ActionResult = {};

const LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  CONFIRMED: "Confirmada",
  PLAYED: "Jugada",
};

export function RoundStatusForm({ roundId, status }: { roundId: string; status: string }) {
  const [state, formAction, pending] = useActionState(updateRoundStatusAction, initial);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="roundId" value={roundId} />
      <label htmlFor={`status-${roundId}`} className="text-xs font-medium text-[var(--muted)]">
        Estado
      </label>
      <select
        id={`status-${roundId}`}
        name="status"
        defaultValue={status}
        disabled={pending}
        className={inputClassName + " max-w-[11rem] py-1.5 text-sm"}
        onChange={(e) => {
          e.currentTarget.form?.requestSubmit();
        }}
      >
        {(["DRAFT", "CONFIRMED", "PLAYED"] as const).map((s) => (
          <option key={s} value={s}>
            {LABELS[s]}
          </option>
        ))}
      </select>
      {state.error && (
        <span className="text-xs text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </span>
      )}
    </form>
  );
}
