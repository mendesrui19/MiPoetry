"use client";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { signUpWithEmail } from "@/components/providers/supabase-provider";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const signup = useStore((s) => s.signup);
  const router = useRouter();
  const cloudMode = isSupabaseConfigured();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim() || !displayName.trim()) {
      setError("Preenche nome de utilizador e nome a mostrar.");
      return;
    }

    setLoading(true);

    if (cloudMode) {
      if (!email.trim() || password.length < 6) {
        setLoading(false);
        setError("Email válido e palavra-passe com pelo menos 6 caracteres.");
        return;
      }

      const { error: authError, session, needsEmailConfirmation } = await signUpWithEmail(
        email,
        password,
        {
          username: username.trim(),
          displayName: displayName.trim(),
          bio,
        }
      );
      setLoading(false);

      if (authError) {
        setError(authError);
        return;
      }

      if (session) {
        router.push("/feed");
        return;
      }

      if (needsEmailConfirmation) {
        setSuccess(
          "Conta criada! Abre o email de confirmação (verifica spam) e só depois entra em «Entrar» com o mesmo email e palavra-passe."
        );
        return;
      }

      setSuccess("Conta criada! Já podes entrar.");
      return;
    }

    const ok = signup({
      username: username.trim(),
      displayName: displayName.trim(),
      bio,
    });
    setLoading(false);

    if (ok) {
      router.push("/feed");
    } else {
      setError("Este nome de utilizador já existe.");
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 safe-top safe-bottom py-8">
      <div className="w-full max-w-sm glass-panel p-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-accent-soft border border-accent/10 mb-5">
            <span className="font-classic text-2xl font-medium text-accent">M</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink mb-2">MiPoetry</h1>
          <p className="text-sm text-ink-muted">Junta-te à comunidade</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-muted mb-1.5 block">
              Nome de utilizador
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ex: meuverso"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-muted mb-1.5 block">
              Nome a mostrar
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="O teu nome"
              required
            />
          </div>

          {cloudMode && (
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
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-medium text-ink-muted mb-1.5 block">
              Bio (opcional)
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Algumas palavras sobre ti..."
              rows={2}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-700">{success}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "A criar..." : "Criar conta"}
          </Button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-6">
          Já tens conta?{" "}
          <Link href="/auth/login" className="text-accent font-medium hover:text-accent-deep">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
