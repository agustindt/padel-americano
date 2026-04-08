"use client";

import { ThemeToggle } from "@/components/ThemeToggle";

export function AuthTopBar() {
  return (
    <div className="fixed right-4 top-4 z-20">
      <ThemeToggle />
    </div>
  );
}
