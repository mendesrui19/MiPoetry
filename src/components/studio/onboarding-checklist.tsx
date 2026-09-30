"use client";

import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { Check, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "mipoetry-onboarding-v2-done";
const DISCOVER_VISIT_KEY = "mipoetry-visited-discover";

export function OnboardingChecklist() {
  const [dismissed, setDismissed] = useState(true);
  const [visitedDiscover, setVisitedDiscover] = useState(false);
  const currentUserId = useStore((s) => s.currentUserId);
  const follows = useStore((s) => s.follows);
  const drafts = useStore((s) => s.drafts);
  const poems = useStore((s) => s.poems);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(Boolean(localStorage.getItem(STORAGE_KEY)));
    setVisitedDiscover(Boolean(localStorage.getItem(DISCOVER_VISIT_KEY)));
  }, []);

  const steps = useMemo(() => {
    if (!currentUserId) return [];
    const followCount = follows.filter((f) => f.followerId === currentUserId).length;
    const hasDraft = drafts.some((d) => d.authorId === currentUserId);
    const hasPublished = poems.some((p) => p.authorId === currentUserId);
    return [
      {
        id: "follow",
        label: "Seguir 2 poetas",
        done: followCount >= 2,
        href: "/search",
      },
      {
        id: "write",
        label: "Escrever um rascunho",
        done: hasDraft || hasPublished,
        href: "/write",
      },
      {
        id: "discover",
        label: "Explorar Descobrir",
        done: visitedDiscover,
        href: "/search",
      },
    ];
  }, [currentUserId, follows, drafts, poems, visitedDiscover]);

  const allDone = steps.length > 0 && steps.every((s) => s.done);
  const doneCount = steps.filter((s) => s.done).length;

  if (!currentUserId || dismissed || allDone || steps.length === 0) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  };

  return (
    <section className="mx-4 mb-4 rounded-2xl border border-accent/15 bg-accent/5 p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-xs font-semibold text-accent uppercase tracking-wide">
            Primeiros passos
          </p>
          <p className="text-sm text-ink-muted mt-0.5">
            {doneCount}/{steps.length} concluídos
          </p>
        </div>
        <button type="button" onClick={dismiss} className="p-1 text-ink-dim" aria-label="Ocultar">
          <X className="h-4 w-4" />
        </button>
      </div>
      <ul className="space-y-2 mb-3">
        {steps.map((step) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface/80 transition-colors"
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                  step.done
                    ? "bg-accent text-white border-accent"
                    : "border-border text-transparent"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
              </span>
              <span className={`text-sm flex-1 ${step.done ? "text-ink-dim line-through" : "text-ink"}`}>
                {step.label}
              </span>
              {!step.done && <ChevronRight className="h-4 w-4 text-ink-dim" />}
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/write">
        <Button size="sm" className="w-full">
          Continuar
        </Button>
      </Link>
    </section>
  );
}
