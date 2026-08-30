"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { usePoemComments, useStore, useUser } from "@/lib/store";
import { RelativeTime } from "@/components/ui/relative-time";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function CommentSection({ poemId }: { poemId: string }) {
  const comments = usePoemComments(poemId);
  const addComment = useStore((s) => s.addComment);
  const currentUserId = useStore((s) => s.currentUserId);
  const [text, setText] = useState("");

  const sorted = [...comments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addComment(poemId, text);
    setText("");
  };

  return (
    <section id="comments" className="px-4 pt-6 pb-2 border-t border-border-faint">
      <h3 className="font-display text-sm font-semibold tracking-tight text-ink mb-4">
        Comentários ({comments.length})
      </h3>

      {currentUserId && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Partilha a tua crítica construtiva..."
            rows={3}
          />
          <Button type="submit" size="sm" disabled={!text.trim()}>
            Comentar
          </Button>
        </form>
      )}

      <div className="space-y-4">
        {sorted.map((comment) => (
          <CommentItem
            key={comment.id}
            id={comment.id}
            authorId={comment.authorId}
            body={comment.body}
            createdAt={comment.createdAt}
          />
        ))}
        {sorted.length === 0 && (
          <p className="text-sm text-ink-dim text-center py-4">
            Ainda sem comentários. Sê o primeiro a responder.
          </p>
        )}
      </div>
    </section>
  );
}

function CommentItem({
  id,
  authorId,
  body,
  createdAt,
}: {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}) {
  const author = useUser(authorId);
  const currentUserId = useStore((s) => s.currentUserId);
  const deleteComment = useStore((s) => s.deleteComment);

  if (!author) return null;

  const isOwn = authorId === currentUserId;

  return (
    <div className="flex gap-3">
      <Link href={`/profile/${author.username}`}>
        <Avatar name={author.displayName} color={author.avatarColor} size="sm" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <div className="flex items-baseline gap-2 min-w-0">
            <Link href={`/profile/${author.username}`} className="text-sm font-semibold text-ink truncate hover:underline">
              {author.displayName}
            </Link>
            <RelativeTime date={createdAt} className="text-xs text-ink-dim shrink-0" />
          </div>
          {isOwn && (
            <button
              onClick={() => deleteComment(id)}
              className="p-1 text-ink-dim hover:text-red-600 shrink-0"
              aria-label="Apagar comentário"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="text-sm text-ink-muted leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
