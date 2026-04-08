import Link from "next/link";
import { auth } from "@/auth";
import { ClientNav } from "@/components/ClientNav";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export async function AppNav() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)]/90 shadow-[var(--shadow-sm)] backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
        <Link href="/" className="group min-w-0 shrink-0 touch-manipulation">
          <span className="font-display text-2xl uppercase tracking-[0.06em] text-[var(--accent-strong)] transition group-hover:text-[var(--accent)] sm:text-3xl">
            {BRAND_NAME}
          </span>
          <span className="block text-[11px] font-medium uppercase leading-snug tracking-wider text-[var(--muted)] sm:text-xs">
            {BRAND_TAGLINE}
          </span>
        </Link>
        <ClientNav userName={session?.user?.name ?? null} />
      </div>
    </header>
  );
}
