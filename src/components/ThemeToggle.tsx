"use client";

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    if (isDark) {
      root.classList.remove("dark");
      localStorage.setItem("americano-theme", "light");
    } else {
      root.classList.add("dark");
      localStorage.setItem("americano-theme", "dark");
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-lg text-[var(--muted)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] active:scale-95"
      aria-label="Cambiar tema claro u oscuro"
      title="Tema"
    >
      <span className="hidden dark:inline" aria-hidden>
        ☀️
      </span>
      <span className="inline dark:hidden" aria-hidden>
        🌙
      </span>
    </button>
  );
}
