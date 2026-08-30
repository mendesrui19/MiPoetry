"use client";

import { useStore } from "@/lib/store";
import { useEffect } from "react";

export function OnlineProvider() {
  const setOnlineStatus = useStore((s) => s.setOnlineStatus);
  const flushOfflineQueue = useStore((s) => s.flushOfflineQueue);

  useEffect(() => {
    const onOnline = () => {
      setOnlineStatus(true);
      flushOfflineQueue();
    };
    const onOffline = () => setOnlineStatus(false);

    setOnlineStatus(navigator.onLine);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [setOnlineStatus, flushOfflineQueue]);

  return null;
}
