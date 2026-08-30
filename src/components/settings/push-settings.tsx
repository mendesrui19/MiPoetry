"use client";

import { Button } from "@/components/ui/button";
import {
  getPushSubscriptionState,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push-client";
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type PushState =
  | "loading"
  | "unsupported"
  | "denied"
  | "default"
  | "subscribed"
  | "granted-not-subscribed";

export function PushSettings() {
  const [state, setState] = useState<PushState>("loading");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!isPushSupported()) {
      setState("unsupported");
      return;
    }
    setState(await getPushSubscriptionState());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const enable = async () => {
    setBusy(true);
    const ok = await subscribeToPush();
    await refresh();
    setBusy(false);
    if (!ok && state !== "denied") {
      alert("Não foi possível activar as notificações push.");
    }
  };

  const disable = async () => {
    setBusy(true);
    await unsubscribeFromPush();
    await refresh();
    setBusy(false);
  };

  if (state === "loading") {
    return (
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        A verificar notificações push...
      </div>
    );
  }

  if (state === "unsupported") {
    return (
      <p className="text-sm text-ink-dim">
        O teu browser não suporta notificações push. Instala a app no ecrã inicial (iOS/Android) e usa Chrome ou Safari recente.
      </p>
    );
  }

  if (state === "denied") {
    return (
      <div className="space-y-2">
        <p className="text-sm text-ink-muted">
          As notificações estão bloqueadas. Activa-as nas definições do browser ou do telemóvel.
        </p>
        <Button variant="outline" size="sm" disabled>
          <BellOff className="h-4 w-4" />
          Bloqueadas
        </Button>
      </div>
    );
  }

  const isSubscribed = state === "subscribed";

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-accent-soft p-2">
          {isSubscribed ? (
            <BellRing className="h-5 w-5 text-accent" />
          ) : (
            <Bell className="h-5 w-5 text-accent" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-ink">Notificações push</p>
          <p className="text-xs text-ink-dim mt-0.5">
            Recebe alertas no telemóvel quando alguém reage, comenta ou publica — mesmo com a app fechada.
          </p>
        </div>
      </div>

      {isSubscribed ? (
        <Button variant="outline" size="sm" disabled={busy} onClick={() => void disable()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellOff className="h-4 w-4" />}
          Desactivar push
        </Button>
      ) : (
        <Button size="sm" disabled={busy} onClick={() => void enable()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
          Activar notificações push
        </Button>
      )}
    </div>
  );
}
