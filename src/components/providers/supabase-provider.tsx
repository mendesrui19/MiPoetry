"use client";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { fetchAllData, fetchPublicData, checkUsernameAvailable } from "@/lib/supabase/api";
import { useStore } from "@/lib/store";
import { useEffect } from "react";

function logSupabaseError(label: string, err: unknown) {
  if (err && typeof err === "object" && "message" in err) {
    console.error(label, (err as { message: string }).message, err);
    return;
  }
  console.error(label, err);
}

export function SupabaseProvider() {
  const setHydrated = useStore((s) => s.setHydrated);
  const setCloudSession = useStore((s) => s.setCloudSession);
  const loadFromCloud = useStore((s) => s.loadFromCloud);
  const clearCloudSession = useStore((s) => s.clearCloudSession);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    const applySession = async (session: { user: { id: string } } | null) => {
      try {
        if (session?.user) {
          const data = await fetchAllData(supabase, session.user.id);
          setCloudSession(session.user.id, true);
          loadFromCloud(data);
        } else {
          clearCloudSession();
          const data = await fetchPublicData(supabase);
          loadFromCloud(data);
        }
      } catch (err) {
        logSupabaseError("Erro ao carregar dados:", err);
        if (session?.user) {
          setCloudSession(session.user.id, true);
          try {
            const fallback = await fetchPublicData(supabase);
            loadFromCloud(fallback);
          } catch (fallbackErr) {
            logSupabaseError("Fallback público falhou:", fallbackErr);
          }
        } else {
          clearCloudSession();
        }
      }
    };

    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await applySession(session);
      setHydrated();
    };

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;
      void applySession(session);
    });

    const refreshFromCloud = useStore.getState().refreshFromCloud;
    let focusTimer: ReturnType<typeof setTimeout> | null = null;
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (focusTimer) clearTimeout(focusTimer);
      focusTimer = setTimeout(() => {
        void refreshFromCloud().catch((err) => logSupabaseError("Refresh:", err));
      }, 400);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
      if (focusTimer) clearTimeout(focusTimer);
    };
  }, [setHydrated, setCloudSession, loadFromCloud, clearCloudSession]);

  return null;
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  meta: { username: string; displayName: string; bio?: string }
) {
  const supabase = createClient();
  const username = meta.username.trim().toLowerCase();
  const available = await checkUsernameAvailable(supabase, username);
  if (!available) {
    return { error: "Este nome de utilizador já existe.", session: false, needsEmailConfirmation: false };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: meta.displayName.trim(),
        bio: meta.bio ?? "",
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return {
    error: error?.message ?? null,
    session: Boolean(data.session),
    needsEmailConfirmation: !data.session && Boolean(data.user),
  };
}

export async function checkUsernameAvailableClient(username: string) {
  const supabase = createClient();
  return checkUsernameAvailable(supabase, username);
}

export async function resetPasswordForEmail(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
  });
  return { error: error?.message ?? null };
}

export async function signOutCloud() {
  const supabase = createClient();
  await supabase.auth.signOut();
}
