"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookmarkSheet } from "@/components/poem/bookmark-sheet";
import { PoemRichBlock } from "@/components/poem/poem-rich-content";
import { PrivacyBadge } from "@/components/poem/privacy-badge";
import { RelativeTime } from "@/components/ui/relative-time";
import { bodyToPlainText } from "@/lib/rich-text";
import { useStore, useUser } from "@/lib/store";
import type { Poem } from "@/lib/types";
import { Bookmark, ChevronRight, Clapperboard, HandMetal, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/cn";

export function PoemCard({
  poem,
  compact = false,
  showPrivacy = false,
}: {
  poem: Poem;
  compact?: boolean;
  showPrivacy?: boolean;
}) {
  const author = useUser(poem.authorId);
  const currentUserId = useStore((s) => s.currentUserId);
  const toggleReaction = useStore((s) => s.toggleReaction);
  const getUserReaction = useStore((s) => s.getUserReaction);
  const isBookmarked = useStore((s) => s.isBookmarked);
  const userReaction = getUserReaction(poem.id);
  const [animating, setAnimating] = useState<"applause" | "snap" | null>(null);
  const [bookmarkOpen, setBookmarkOpen] = useState(false);

  if (!author) return null;

  const bookmarked = isBookmarked(poem.id);
  const plainBody = bodyToPlainText(poem.body).trim();
  const isLong = plainBody.length > 120;

  const handleReaction = (type: "applause" | "snap") => {
    if (!currentUserId) return;
    setAnimating(type);
    toggleReaction(poem.id, type);
    setTimeout(() => setAnimating(null), 400);
  };

  return (
    <article className="mx-4 mb-3 glass-panel overflow-hidden transition-shadow hover:shadow-md">
      <div className="px-4 pt-4 pb-3">
        <Link
          href={`/profile/${author.username}`}
          className="flex items-center gap-3 mb-3 active:opacity-80 transition-opacity"
        >
          <Avatar
            name={author.displayName}
            color={author.avatarColor}
            imageUrl={author.avatarUrl}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-ink truncate">{author.displayName}</span>
              <span className="text-xs text-ink-dim">@{author.username}</span>
              {(showPrivacy || poem.privacy !== "public") && (
                <PrivacyBadge privacy={poem.privacy} showLabel={showPrivacy} />
              )}
            </div>
            <RelativeTime date={poem.createdAt} className="text-xs text-ink-dim mt-0.5" />
          </div>
        </Link>

        <Link href={`/poem/${poem.id}`} className="block group active:opacity-95 transition-opacity">
          <PoemRichBlock
            title={poem.title}
            body={poem.body}
            font={poem.font}
            theme={poem.theme}
            textColor={poem.textColor}
            fontSize={poem.fontSize}
            clipped={compact}
            bodyClassName={compact ? "text-sm" : undefined}
          />
          {compact && (
            <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-accent group-hover:underline">
              {isLong ? "Ver poema completo" : "Abrir poema"}
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </Link>
      </div>

      {poem.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
          {(compact ? poem.hashtags.slice(0, 3) : poem.hashtags).map((tag) => (
            <Link key={tag} href={`/search?q=${tag}`}>
              <Badge variant="accent">#{tag}</Badge>
            </Link>
          ))}
          {compact && poem.hashtags.length > 3 && (
            <span className="text-xs text-ink-dim self-center">+{poem.hashtags.length - 3}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between px-3 pb-3 pt-1 border-t border-border-faint">
        <div className="flex items-center">
          <button
            onClick={() => handleReaction("applause")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors",
              userReaction === "applause" ? "text-accent bg-accent-soft" : "text-ink-muted hover:bg-surface-up",
              animating === "applause" && "animate-applause"
            )}
            aria-label="Aplausos"
          >
            <Clapperboard className="h-4 w-4" />
            <span className="tabular-nums">{poem.applauseCount}</span>
          </button>
          <button
            onClick={() => handleReaction("snap")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors",
              userReaction === "snap" ? "text-accent bg-accent-soft" : "text-ink-muted hover:bg-surface-up",
              animating === "snap" && "animate-snap"
            )}
            aria-label="Estalar de dedos"
          >
            <HandMetal className="h-4 w-4" />
            <span className="tabular-nums">{poem.snapCount}</span>
          </button>
          <Link
            href={`/poem/${poem.id}#comments`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-ink-muted hover:bg-surface-up transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="tabular-nums">{poem.commentCount}</span>
          </Link>
        </div>
        <button
          onClick={() => setBookmarkOpen(true)}
          className={cn(
            "p-2 rounded-lg transition-colors",
            bookmarked ? "text-accent bg-accent-soft" : "text-ink-muted hover:bg-surface-up"
          )}
          aria-label={bookmarked ? "Gerir guardado" : "Guardar"}
        >
          <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
        </button>
      </div>
      <BookmarkSheet poemId={poem.id} open={bookmarkOpen} onClose={() => setBookmarkOpen(false)} />
    </article>
  );
}
