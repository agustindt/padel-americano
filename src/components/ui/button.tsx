import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex touch-manipulation items-center justify-center font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        "rounded-[var(--radius-sm)]",
        variant === "primary" &&
          "bg-[var(--accent)] text-white shadow-[var(--shadow-sm)] hover:bg-[var(--accent-hover)]",
        variant === "secondary" &&
          "bg-[var(--accent-secondary)] text-[var(--foreground)] hover:bg-[var(--accent-secondary-hover)]",
        variant === "outline" &&
          "border border-[var(--border)] bg-transparent hover:bg-[var(--surface-hover)]",
        variant === "ghost" && "border border-transparent hover:bg-[var(--surface-hover)]",
        size === "sm" && "min-h-11 px-4 py-2 text-sm",
        size === "md" && "min-h-11 px-4 py-2.5 text-base sm:text-sm",
        size === "lg" && "min-h-12 px-5 py-3 text-base",
        className,
      )}
      {...props}
    />
  );
}
