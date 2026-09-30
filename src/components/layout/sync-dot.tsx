"use client";

import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";

export function SyncDot({ className }: { className?: string }) {
  const cloudEnabled = useStore((s) => s.cloudEnabled);
  const isOnline = useStore((s) => s.isOnline);
  const lastCloudSyncAt = useStore((s) => s.lastCloudSyncAt);

  if (!cloudEnabled) return null;

  const ok = isOnline && lastCloudSyncAt;
  const label = !isOnline
    ? "Offline — alterações guardadas localmente"
    : ok
      ? "Sincronizado com a cloud"
      : "A sincronizar…";

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-[10px] text-ink-dim", className)}
      title={label}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          !isOnline ? "bg-amber-500" : ok ? "bg-emerald-500" : "bg-ink-dim animate-pulse"
        )}
        aria-hidden
      />
      <span className="hidden sm:inline">{!isOnline ? "Offline" : ok ? "Sync" : "…"}</span>
    </span>
  );
}
