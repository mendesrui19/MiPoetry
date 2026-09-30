"use client";

import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { pickActiveChallenge } from "@/lib/challenges";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function WeeklyChallengeCard() {
  const challenges = useStore((s) => s.challenges);
  const getVisiblePoems = useStore((s) => s.getVisiblePoems);
  const currentUserId = useStore((s) => s.currentUserId);

  const challenge = pickActiveChallenge(challenges);
  if (!challenge) return null;

  const tag = challenge.hashtag.replace(/^#/, "");
  const entries = getVisiblePoems(currentUserId).filter((p) =>
    p.hashtags.some((h) => h.toLowerCase() === tag)
  );

  return (
    <section className="mx-4 mb-4 glass-panel p-4 border-accent/15">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent/80 mb-0.5">
            Desafio da semana
          </p>
          <h2 className="font-display text-base font-bold text-ink mb-1">{challenge.title}</h2>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">{challenge.prompt}</p>
          <p className="text-xs text-ink-dim mb-3">
            Usa <span className="font-medium text-accent">#{tag}</span> ao publicar ·{" "}
            {entries.length} {entries.length === 1 ? "participação" : "participações"}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href={`/write?challenge=${encodeURIComponent(tag)}`}>
              <Button size="sm">Participar</Button>
            </Link>
            <Link href={`/search?q=${encodeURIComponent(tag)}`}>
              <Button size="sm" variant="outline">
                Ver entradas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
