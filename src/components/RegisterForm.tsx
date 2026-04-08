"use client";

import { useActionState } from "react";
import { registerUser, type AuthFormState } from "@/app/actions/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/ui/input-styles";

const initial: AuthFormState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerUser, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-[var(--muted)]">
          Nombre (como te verán en la tabla)
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          autoComplete="name"
          className={inputClassName}
        />
      </div>
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
          Contraseña (mín. 6)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className={inputClassName}
        />
      </div>
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creando…" : "Registrarme"}
      </Button>
      <p className="text-center text-sm text-[var(--muted)]">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
