"use client";

import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const isOnline = useStore((s) => s.isOnline);
  const queueLen = useStore((s) => s.offlineQueue.length);

  if (isOnline && queueLen === 0) return null;

  return (
    <div
      className={cn(
        "fixed top-[calc(var(--safe-top)+var(--header-height))] inset-x-0 z-50 mx-auto max-w-lg px-4",
        "pointer-events-none"
      )}
    >
      <div className="flex items-center justify-center gap-2 rounded-xl bg-stone-900/90 text-stone-50 text-xs py-2 px-3 shadow-md backdrop-blur">
        <WifiOff className="h-3.5 w-3.5 shrink-0" />
        {!isOnline
          ? "Modo offline — escreves à vontade, sincroniza quando houver net"
          : `A sincronizar ${queueLen} alteração${queueLen === 1 ? "" : "ões"}…`}
      </div>
    </div>
  );
}
