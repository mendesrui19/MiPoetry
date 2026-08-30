"use client";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { notificationLink, notificationMessage } from "@/lib/notification-text";
import { useCurrentUser, useStore } from "@/lib/store";
import type { NotificationType } from "@/lib/types";
import { useEffect } from "react";

export function PushProvider() {
  const user = useCurrentUser();
  const users = useStore((s) => s.users);
  const poems = useStore((s) => s.poems);

  useEffect(() => {
    if (!user || !isSupabaseConfigured()) return;
    if (!("serviceWorker" in navigator) || Notification.permission !== "granted") return;

    const supabase = createClient();

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const row = payload.new as {
            id?: string;
            actor_id: string;
            type: NotificationType;
            poem_id?: string;
          };

          const actor = users.find((u) => u.id === row.actor_id);
          const poem = row.poem_id ? poems.find((p) => p.id === row.poem_id) : undefined;

          const title = "MiPoetry";
          const body = notificationMessage(
            row.type,
            actor?.displayName ?? "Alguém",
            poem?.title
          );
          const url = notificationLink(row.type, row.poem_id, actor?.username);

          try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, {
              body,
              icon: "/icons/icon-192.png",
              badge: "/icons/icon-192.png",
              tag: row.id ? `mipoetry-${row.id}` : "mipoetry-realtime",
              data: { url },
            });
          } catch {
            /* fallback silencioso */
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, users, poems]);

  return null;
}
