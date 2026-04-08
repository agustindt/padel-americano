import { BRAND_NAME } from "@/lib/brand";

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)]/80 py-4 text-center backdrop-blur-sm">
      <p className="text-xs text-[var(--muted)]">
        <span className="font-medium text-[var(--foreground)]">{BRAND_NAME}</span>
        {" · "}
        Hecho para el grupo · v0.1.0
      </p>
    </footer>
  );
}
