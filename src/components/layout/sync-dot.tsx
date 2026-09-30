"use client";

import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import { useState } from "react";

export function SyncDot({ className }: { className?: string }) {
  const cloudEnabled = useStore((s) => s.cloudEnabled);
  const isOnline = useStore((s) => s.isOnline);
  const lastCloudSyncAt = useStore((s) => s.lastCloudSyncAt);
  const refreshFromCloud = useStore((s) => s.refreshFromCloud);
  const [syncing, setSyncing] = useState(false);

  if (!cloudEnabled) return null;

  const ok = isOnline && lastCloudSyncAt && !syncing;
  const label = !isOnline
    ? "Offline — alterações guardadas localmente"
    : syncing
      ? "A sincronizar…"
      : ok
        ? "Sincronizado — toque para atualizar"
        : "A sincronizar…";

  const handleRefresh = () => {
    if (!isOnline || syncing) return;
    setSyncing(true);
    void refreshFromCloud().finally(() => setSyncing(false));
  };

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={!isOnline || syncing}
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] text-ink-dim rounded-md px-1 -mx-1 hover:bg-surface-up disabled:opacity-60",
        className
      )}
      title={label}
      aria-label={label}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          !isOnline ? "bg-amber-500" : ok ? "bg-emerald-500" : "bg-ink-dim animate-pulse"
        )}
        aria-hidden
      />
      <span className="hidden sm:inline">
        {!isOnline ? "Offline" : syncing ? "…" : ok ? "Sync" : "…"}
      </span>
    </button>
  );
}
