"use client";

import { cn } from "@/lib/cn";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function Collapsible({
  title,
  icon,
  defaultOpen = false,
  badge,
  children,
  className,
}: {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn("border-t border-border-faint", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left active:bg-surface-up transition-colors"
      >
        {icon}
        <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          {title}
        </span>
        {badge && <span className="text-[10px] text-ink-dim">{badge}</span>}
        <ChevronDown
          className={cn("h-4 w-4 text-ink-dim transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
