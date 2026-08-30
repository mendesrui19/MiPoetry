"use client";

import { cn } from "@/lib/cn";

export function AppBackground({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative min-h-dvh", className)}>
      <div className="app-mesh pointer-events-none fixed inset-0 -z-10" aria-hidden />
      {children}
    </div>
  );
}
