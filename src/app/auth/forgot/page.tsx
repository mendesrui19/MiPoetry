"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPasswordForEmail } from "@/components/providers/supabase-provider";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const cloudMode = isSupabaseConfigured();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const { error: resetError } = await resetPasswordForEmail(email.trim());
    setLoading(false);

    if (resetError) {
      setError(resetError);
      return;
    }

    setSuccess("Enviámos um link para o teu email. Verifica a caixa de entrada.");
  };

  if (!cloudMode) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 safe-top safe-bottom">
        <p className="text-sm text-ink-muted mb-4 text-center">
          Recuperação de palavra-passe só está disponível com conta cloud.
        </p>
        <Link href="/auth/login">
          <Button variant="outline">Voltar ao login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 safe-top safe-bottom py-8">
      <div className="w-full max-w-sm glass-panel p-8">
        <h1 className="font-display text-xl font-bold text-ink mb-2">Recuperar palavra-passe</h1>
        <p className="text-sm text-ink-muted mb-6">
          Introduz o teu email e enviamos um link para redefinires a palavra-passe.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-muted mb-1.5 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-700">{success}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "A enviar…" : "Enviar link"}
          </Button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-6">
          <Link href="/auth/login" className="text-accent font-medium">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
