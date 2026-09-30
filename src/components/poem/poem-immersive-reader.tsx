"use client";

import { PoemRichContent } from "@/components/poem/poem-rich-content";
import { cn, resolvePoemStyle } from "@/lib/cn";
import type { Poem, User } from "@/lib/types";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export function PoemImmersiveReader({
  poems,
  initialIndex,
  authorByPoemId,
  onClose,
}: {
  poems: Poem[];
  initialIndex: number;
  authorByPoemId: (poem: Poem) => User | undefined;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const poem = poems[index];
  const style = poem ? resolvePoemStyle(poem) : null;
  const author = poem ? authorByPoemId(poem) : undefined;

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => {
        const next = i + delta;
        if (next < 0 || next >= poems.length) return i;
        return next;
      });
    },
    [poems.length]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  if (!poem || !style) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-paper safe-top safe-bottom flex flex-col"
      onTouchStart={(e) => {
        const t = e.changedTouches[0];
        touchStart.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        if (!touchStart.current) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - touchStart.current.x;
        const dy = t.clientY - touchStart.current.y;
        touchStart.current = null;
        if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
        if (dx < 0) go(1);
        else go(-1);
      }}
    >
      <header className="flex items-center justify-between px-4 py-3 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-ink-muted hover:bg-surface"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
        <span className="text-xs text-ink-dim tabular-nums">
          {index + 1} / {poems.length}
        </span>
        <div className="w-9" aria-hidden />
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <div className="mx-auto max-w-lg min-h-full flex flex-col justify-center py-6">
          {author && (
            <p className="text-center text-sm text-ink-dim mb-6">— {author.displayName}</p>
          )}
          <h1
            className={cn("text-3xl sm:text-4xl font-semibold mb-8 text-center leading-tight", style.fontClassName)}
            style={{ color: style.textColor }}
          >
            {poem.title}
          </h1>
          <PoemRichContent
            body={poem.body}
            font={poem.font}
            theme={poem.theme}
            textColor={poem.textColor}
            fontSize={poem.fontSize}
            className={cn("leading-loose text-lg sm:text-xl", style.fontSizeClassName)}
          />
        </div>
      </div>

      {poems.length > 1 && (
        <footer className="shrink-0 border-t border-border-faint bg-surface/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between gap-3 safe-bottom">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => go(-1)}
            className="flex items-center gap-1 text-sm font-medium text-ink disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>
          <p className="text-[10px] text-ink-dim uppercase tracking-wide">Desliza ↔</p>
          <button
            type="button"
            disabled={index >= poems.length - 1}
            onClick={() => go(1)}
            className="flex items-center gap-1 text-sm font-medium text-ink disabled:opacity-30"
          >
            Seguinte
            <ChevronRight className="h-4 w-4" />
          </button>
        </footer>
      )}
    </div>
  );
}
