"use client";

import { logoutAction } from "@/app/actions/session";
import { NavLink } from "@/components/ui/nav-link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

type ClientNavProps = {
  userName: string | null;
};

export function ClientNav({ userName }: ClientNavProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <nav className="flex flex-wrap items-center gap-1">
        <NavLink href="/posiciones">Tabla</NavLink>
        <NavLink href="/fechas">Fechas</NavLink>
      </nav>
      <ThemeToggle />
      {userName ? (
        <>
          <span className="hidden max-w-[10rem] truncate text-sm text-[var(--muted)] sm:inline" title={userName}>
            {userName}
          </span>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm" className="text-[var(--muted)]">
              Salir
            </Button>
          </form>
        </>
      ) : null}
    </div>
  );
}
