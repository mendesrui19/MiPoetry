"use client";

import { cn } from "@/lib/cn";
import type { Book, User } from "@/lib/types";
import { BookOpen } from "lucide-react";
import Link from "next/link";

export function BookDiscoverCard({
  book,
  author,
  compact,
  className,
}: {
  book: Book;
  author?: User;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/book/${book.slug}`}
      className={cn(
        "block shrink-0 active:scale-[0.98] transition-transform",
        compact ? "w-[7.5rem]" : "w-[8.5rem]",
        className
      )}
    >
      <div
        className={cn(
          "rounded-xl border border-border/80 overflow-hidden shadow-sm bg-surface",
          compact ? "aspect-[2/3]" : "aspect-[2/3]"
        )}
      >
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-accent/10 to-accent/5 p-3 text-center">
            <BookOpen className="h-6 w-6 text-accent/70 mb-2" />
            <p className="font-classic text-xs font-semibold text-ink line-clamp-3 leading-snug">
              {book.title}
            </p>
          </div>
        )}
      </div>
      <p className="mt-2 text-sm font-medium text-ink truncate">{book.title}</p>
      <p className="text-xs text-ink-dim truncate">
        {author ? author.displayName : "Autor"}
        {book.poemIds.length > 0 && ` · ${book.poemIds.length} poemas`}
      </p>
    </Link>
  );
}

export function BookDiscoverRow({
  books,
  users,
}: {
  books: Book[];
  users: User[];
}) {
  if (books.length === 0) return null;

  return (
    <div className="pb-4">
      <p className="px-4 pb-3 text-xs font-medium text-ink-muted uppercase tracking-wide">
        Antologias
      </p>
      <div className="flex gap-3 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {books.map((book) => (
          <BookDiscoverCard
            key={book.id}
            book={book}
            author={users.find((u) => u.id === book.authorId)}
          />
        ))}
      </div>
    </div>
  );
}
