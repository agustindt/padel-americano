import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type EmptyStateProps = {
  emoji: string;
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
};

export function EmptyState({ emoji, title, description, className, children }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/40 px-4 py-10 text-center sm:px-6 sm:py-12",
        className,
      )}
    >
      <span className="text-4xl" aria-hidden>
        {emoji}
      </span>
      <p className="mt-3 font-display text-xl uppercase tracking-wide text-[var(--foreground)] sm:text-2xl">
        {title}
      </p>
      <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">{description}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
