"use client";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useStore } from "@/lib/store";
import { useEffect, useRef } from "react";

const REFRESH_INTERVAL_MS = 45_000;

export function CloudSyncProvider() {
  const cloudEnabled = useStore((s) => s.cloudEnabled);
  const hydrated = useStore((s) => s.hydrated);
  const refreshFromCloud = useStore((s) => s.refreshFromCloud);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !hydrated) return;

    const scheduleRefresh = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void refreshFromCloud().catch((err) => {
          console.error("Cloud refresh error:", err);
        });
      }, 800);
    };

    void refreshFromCloud().catch(console.error);

    const interval = setInterval(() => {
      void refreshFromCloud().catch(console.error);
    }, REFRESH_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") scheduleRefresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    const supabase = createClient();
    const channel = supabase
      .channel("mipoetry-public-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "poems" },
        scheduleRefresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        scheduleRefresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "follows" },
        scheduleRefresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reactions" },
        scheduleRefresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        scheduleRefresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "books" },
        scheduleRefresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "book_poems" },
        scheduleRefresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "book_sections" },
        scheduleRefresh
      );

    if (cloudEnabled) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        scheduleRefresh
      );
      for (const table of ["drafts", "draft_versions", "bookmarks"] as const) {
        channel.on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          scheduleRefresh
        );
      }
    }

    channel.subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      void supabase.removeChannel(channel);
    };
  }, [hydrated, cloudEnabled, refreshFromCloud]);

  return null;
}
