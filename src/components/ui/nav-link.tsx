"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
};

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 touch-manipulation items-center justify-center rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-[var(--surface-muted)] text-[var(--accent-strong)]"
          : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]",
      )}
    >
      {children}
    </Link>
  );
}
