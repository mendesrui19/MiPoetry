"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithEmail } from "@/components/providers/supabase-provider";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const login = useStore((s) => s.login);
  const router = useRouter();
  const cloudMode = isSupabaseConfigured();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (cloudMode) {
      const { error: authError } = await signInWithEmail(email, password);
      setLoading(false);
      if (authError) {
        setError(authError);
        return;
      }
      router.push("/feed");
      return;
    }

    const ok = login(username);
    setLoading(false);
    if (ok) {
      router.push("/feed");
    } else {
      setError("Utilizador não encontrado. Tenta: ruimendes, inesmar, tomasverso, luaferreira, zepassaro");
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 safe-top safe-bottom py-8">
      <div className="w-full max-w-sm glass-panel p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-accent/10 border border-accent/15 mb-5">
            <span className="font-classic text-2xl font-medium text-accent">M</span>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent/80 mb-2">
            MiPoetry
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-ink-muted">Escreve. Lê. Partilha poesia.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {cloudMode ? (
            <>
              <div>
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">
                  Palavra-passe
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
            </>
          ) : (
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1.5 block">
                Nome de utilizador
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: ruimendes"
                autoComplete="username"
                required
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "A entrar..." : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-4">
          <Link href="/auth/forgot" className="text-accent font-medium hover:text-accent-deep">
            Esqueci a palavra-passe
          </Link>
        </p>

        <p className="text-center text-sm text-ink-muted mt-4">
          Não tens conta?{" "}
          <Link href="/auth/signup" className="text-accent font-medium hover:text-accent-deep">
            Criar conta
          </Link>
        </p>

        {!cloudMode && (
          <p className="text-center text-xs text-ink-dim mt-8">
            Demo: ruimendes · inesmar · tomasverso · luaferreira · zepassaro
          </p>
        )}
      </div>
    </div>
  );
}
