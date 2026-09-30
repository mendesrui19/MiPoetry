"use client";

import { useToastStore } from "@/lib/toast";
import { cn } from "@/lib/cn";
import { X } from "lucide-react";

export function ToastProvider() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-[calc(var(--safe-top)+0.75rem)] inset-x-0 z-[110] flex flex-col items-center gap-2 px-4 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto w-full max-w-sm rounded-xl border px-4 py-3 shadow-lg backdrop-blur-xl flex items-start gap-3 animate-fade-up",
            t.type === "success" && "bg-surface/95 border-accent/20 text-ink",
            t.type === "error" && "bg-red-50 border-red-200 text-red-900",
            t.type === "info" && "bg-surface/95 border-border text-ink"
          )}
        >
          <p className="text-sm font-medium flex-1 leading-snug">{t.message}</p>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="p-0.5 text-ink-dim hover:text-ink shrink-0"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
