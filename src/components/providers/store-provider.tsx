"use client";

import { useStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useEffect, useState } from "react";

export function StoreHydration() {
  useEffect(() => {
    if (isSupabaseConfigured()) return;

    const unsub = useStore.persist.onFinishHydration(() => {
      useStore.getState().setHydrated();
    });

    void useStore.persist.rehydrate();

    return unsub;
  }, []);

  return null;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const storeHydrated = useStore((s) => s.hydrated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !storeHydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-paper safe-top safe-bottom">
        <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
