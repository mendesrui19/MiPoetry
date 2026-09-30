"use client";

import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useStore } from "@/lib/store";
import { Cloud, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useMounted } from "@/lib/use-mounted";

export function CloudSyncStatus() {
  const cloudEnabled = useStore((s) => s.cloudEnabled);
  const lastCloudSyncAt = useStore((s) => s.lastCloudSyncAt);
  const refreshFromCloud = useStore((s) => s.refreshFromCloud);
  const users = useStore((s) => s.users);
  const poems = useStore((s) => s.poems);
  const books = useStore((s) => s.books);
  const follows = useStore((s) => s.follows);
  const [syncing, setSyncing] = useState(false);
  const mounted = useMounted();
  const [lastSyncLabel, setLastSyncLabel] = useState("A aguardar…");

  useEffect(() => {
    if (!mounted) return;
    setLastSyncLabel(
      lastCloudSyncAt
        ? new Date(lastCloudSyncAt).toLocaleTimeString("pt-PT", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        : "A aguardar…"
    );
  }, [mounted, lastCloudSyncAt]);

  if (!isSupabaseConfigured()) {
    return (
      <div className="glass-panel p-4 space-y-2">
        <p className="text-sm font-medium text-ink">Modo local</p>
        <p className="text-xs text-ink-muted leading-relaxed">
          Supabase não configurado — os dados ficam só neste dispositivo.
        </p>
      </div>
    );
  }

  const publicPoems = poems.filter((p) => p.privacy === "public").length;
  const publicBooks = books.filter((b) => b.isPublic).length;

  const handleRefresh = async () => {
    setSyncing(true);
    try {
      await refreshFromCloud();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="glass-panel p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Cloud className="h-4 w-4 text-accent" />
        <p className="text-sm font-medium text-ink">Cloud sincronizada</p>
        {cloudEnabled && (
          <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
            Online
          </span>
        )}
      </div>

      <p className="text-xs text-ink-muted leading-relaxed">
        Todos os utilizadores partilham a mesma base de dados. Poemas, seguidores,
        reacções, comentários, antologias e notificações sincronizam automaticamente.
      </p>

      <div className="grid grid-cols-2 gap-2 text-center">
        <Stat label="Escritores" value={users.length} />
        <Stat label="Poemas visíveis" value={poems.length} />
        <Stat label="Públicos" value={publicPoems} />
        <Stat label="Antologias" value={publicBooks} />
        <Stat label="Seguidores" value={follows.length} />
        <Stat label="Total livros" value={books.length} />
      </div>

      <p className="text-[11px] text-ink-dim text-center">
        Última sincronização: {lastSyncLabel}
      </p>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleRefresh}
        disabled={syncing}
      >
        <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "A sincronizar…" : "Sincronizar agora"}
      </Button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-surface/80 border border-border-faint py-2.5 px-2">
      <p className="text-lg font-semibold text-ink tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-ink-dim">{label}</p>
    </div>
  );
}
