"use client";

import { cn } from "@/lib/cn";

interface TabsProps {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1 p-1 bg-surface-up rounded-xl", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
            active === tab.id
              ? "bg-surface text-ink shadow-sm ring-1 ring-border/60"
              : "text-ink-muted hover:text-ink"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
