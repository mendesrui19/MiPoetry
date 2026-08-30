"use client";

import { PageShell } from "@/components/layout/bottom-nav";
import { QuickActions } from "@/components/layout/quick-actions";
import { PoemCard } from "@/components/poem/poem-card";
import { WelcomeTour } from "@/components/studio/welcome-tour";
import { WriterStudio } from "@/components/studio/writer-studio";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useStore } from "@/lib/store";
import { Bell, Compass, Search } from "lucide-react";
import Link from "next/link";

export default function FeedPage() {
  const user = useCurrentUser();
  const getFeedFollowing = useStore((s) => s.getFeedFollowing);
  const unread = useStore((s) => s.getUnreadNotificationCount());

  const poems = getFeedFollowing();

  return (
    <PageShell>
      <WelcomeTour />

      <header className="sticky top-0 z-40 border-b border-border-faint/80 bg-surface/70 backdrop-blur-xl px-4 py-3 safe-top min-h-[calc(var(--header-height)+var(--safe-top))]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent/80">
              MiPoetry
            </p>
            <h1 className="font-display text-lg font-bold tracking-tight text-ink">
              {user ? "A Seguir" : "Feed"}
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/search" className="p-2 rounded-xl text-ink-muted hover:bg-surface-up" aria-label="Descobrir">
              <Search className="h-5 w-5" />
            </Link>
            <Link href="/notifications" className="relative p-2 rounded-xl text-ink-muted hover:bg-surface-up" aria-label="Alertas">
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <WriterStudio />

      <QuickActions />

      {poems.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-4">
            <Compass className="h-6 w-6" />
          </div>
          <p className="text-sm text-ink-muted mb-1">
            Ainda não há poemas de quem segues.
          </p>
          <p className="text-xs text-ink-dim mb-5">
            O feed mostra autores que segues. Para explorar a comunidade, antologias e poemas em destaque, usa Descobrir.
          </p>
          <Link href="/search">
            <Button>
              <Compass className="h-4 w-4" />
              Ir para Descobrir
            </Button>
          </Link>
        </div>
      ) : (
        <div className="pt-1 pb-2">
          {poems.map((poem, i) => (
            <div key={poem.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}>
              <PoemCard poem={poem} compact />
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
