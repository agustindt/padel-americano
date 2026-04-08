"use client";

import { useActionState } from "react";
import { loginUser, type AuthFormState } from "@/app/actions/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/ui/input-styles";

const initial: AuthFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginUser, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-[var(--muted)]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClassName}
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-[var(--muted)]">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClassName}
        />
      </div>
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Entrando…" : "Entrar"}
      </Button>
      <p className="text-center text-sm text-[var(--muted)]">
        ¿Primera vez?{" "}
        <Link href="/register" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}
