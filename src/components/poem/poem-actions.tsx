"use client";

import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import type { Poem } from "@/lib/types";
import { Bookmark, Clapperboard, HandMetal, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BookmarkSheet } from "./bookmark-sheet";

export function PoemActions({ poem }: { poem: Poem }) {
  const currentUserId = useStore((s) => s.currentUserId);
  const toggleReaction = useStore((s) => s.toggleReaction);
  const getUserReaction = useStore((s) => s.getUserReaction);
  const isBookmarked = useStore((s) => s.isBookmarked);
  const userReaction = getUserReaction(poem.id);
  const [animating, setAnimating] = useState<"applause" | "snap" | null>(null);
  const [bookmarkOpen, setBookmarkOpen] = useState(false);
  const bookmarked = isBookmarked(poem.id);

  const handleReaction = (type: "applause" | "snap") => {
    if (!currentUserId) return;
    setAnimating(type);
    toggleReaction(poem.id, type);
    setTimeout(() => setAnimating(null), 400);
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 py-4 border-t border-border-faint">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleReaction("applause")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors",
              userReaction === "applause" ? "text-accent bg-accent/10" : "text-ink-muted hover:bg-surface",
              animating === "applause" && "animate-applause"
            )}
            aria-label="Aplausos"
          >
            <Clapperboard className="h-4 w-4" />
            <span>{poem.applauseCount}</span>
          </button>
          <button
            onClick={() => handleReaction("snap")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors",
              userReaction === "snap" ? "text-accent bg-accent/10" : "text-ink-muted hover:bg-surface",
              animating === "snap" && "animate-snap"
            )}
            aria-label="Estalar de dedos"
          >
            <HandMetal className="h-4 w-4" />
            <span>{poem.snapCount}</span>
          </button>
          <Link
            href={`/poem/${poem.id}#comments`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-ink-muted hover:bg-surface transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{poem.commentCount}</span>
          </Link>
        </div>
        <button
          onClick={() => setBookmarkOpen(true)}
          className={cn(
            "p-2 rounded-xl transition-colors",
            bookmarked ? "text-accent" : "text-ink-muted hover:bg-surface"
          )}
          aria-label={bookmarked ? "Gerir guardado" : "Guardar"}
        >
          <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
        </button>
      </div>
      <BookmarkSheet poemId={poem.id} open={bookmarkOpen} onClose={() => setBookmarkOpen(false)} />
    </>
  );
}
