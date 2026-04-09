import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)]/80 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs text-[var(--muted)]">
          <span className="font-medium text-[var(--foreground)]">{BRAND_NAME}</span>
          {" · "}
          Hecho para el grupo · v0.1.0
        </p>
        <nav
          className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs"
          aria-label="Enlaces del pie"
        >
          <Link
            href="/posiciones"
            className="text-[var(--muted)] underline-offset-2 hover:text-[var(--accent)] hover:underline"
          >
            Tabla
          </Link>
          <Link
            href="/fechas"
            className="text-[var(--muted)] underline-offset-2 hover:text-[var(--accent)] hover:underline"
          >
            Fechas
          </Link>
          <Link
            href="/reglas"
            className="text-[var(--muted)] underline-offset-2 hover:text-[var(--accent)] hover:underline"
          >
            Reglas
          </Link>
        </nav>
      </div>
    </footer>
  );
}
