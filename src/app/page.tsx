"use client";

import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { BookOpen, PenLine, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const features = [
  {
    icon: PenLine,
    title: "Editor fiel ao autor",
    body: "Formatação rica, fontes e cores — o poema fica exactamente como o imaginas.",
  },
  {
    icon: BookOpen,
    title: "Antologias partilháveis",
    body: "Capa, dedicação, prefácio e poemas ordenados num livro com link bonito.",
  },
  {
    icon: Users,
    title: "Comunidade de poetas",
    body: "Publica, recebe reacções, segue autores e descobre vozes novas em português.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const hydrated = useStore((s) => s.hydrated);
  const currentUserId = useStore((s) => s.currentUserId);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && hydrated && currentUserId) {
      router.replace("/feed");
    }
  }, [mounted, hydrated, currentUserId, router]);

  if (!mounted || !hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center safe-top safe-bottom">
        <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (currentUserId) return null;

  return (
    <div className="min-h-dvh flex flex-col safe-top safe-bottom">
      <header className="px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent/80">
            MiPoetry
          </p>
          <p className="text-sm text-ink-muted">Rede social de poesia</p>
        </div>
        <Link href="/auth/login">
          <Button variant="ghost" size="sm">
            Entrar
          </Button>
        </Link>
      </header>

      <main className="flex-1 px-6 pb-8 flex flex-col justify-center max-w-lg mx-auto w-full">
        <div className="studio-glow pointer-events-none absolute top-24 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full opacity-60" aria-hidden />

        <div className="relative animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Beta — testa e dá feedback
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-ink leading-[1.1] mb-4">
            O teu estúdio de poesia,{" "}
            <span className="text-accent">no bolso</span>
          </h1>

          <p className="text-base text-ink-muted leading-relaxed mb-6 max-w-md">
            Escreve com formatação rica, publica na comunidade, monta antologias e partilha
            poemas que ficam exactamente como os escreveste.
          </p>

          <p className="text-sm text-ink-dim mb-8 max-w-md">
            Cria conta com email — demora menos de um minuto. Já há escritores e antologias
            na comunidade para explorares.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Link href="/auth/signup" className="flex-1">
              <Button size="lg" className="w-full shadow-lg shadow-accent/20">
                Criar conta grátis
              </Button>
            </Link>
            <Link href="/auth/login" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="glass-panel p-4 flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="text-sm text-ink-muted leading-relaxed mt-0.5">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-ink-dim border-t border-border-faint">
        © {new Date().getFullYear()} MiPoetry — poesia em português
      </footer>
    </div>
  );
}
