"use client";

import { ThemeToggle } from "@/components/ThemeToggle";

export function AuthTopBar() {
  return (
    <div className="fixed right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-20">
      <ThemeToggle />
    </div>
  );
}
