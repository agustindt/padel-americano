import Link from "next/link";
import { auth } from "@/auth";
import { ClientNav } from "@/components/ClientNav";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export async function AppNav() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)]/90 shadow-[var(--shadow-sm)] backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="group block min-w-0">
          <span className="font-display text-2xl uppercase tracking-[0.06em] text-[var(--accent-strong)] transition group-hover:text-[var(--accent)] sm:text-3xl">
            {BRAND_NAME}
          </span>
          <span className="block text-[10px] font-medium uppercase tracking-wider text-[var(--muted)] sm:text-xs">
            {BRAND_TAGLINE}
          </span>
        </Link>
        <ClientNav userName={session?.user?.name ?? null} />
      </div>
    </header>
  );
}
