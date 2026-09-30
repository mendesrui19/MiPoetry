"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import Link from "next/link";

export function SuggestedAuthorsRow() {
  const currentUserId = useStore((s) => s.currentUserId);
  const getSuggestedAuthors = useStore((s) => s.getSuggestedAuthors);
  const isFollowing = useStore((s) => s.isFollowing);
  const follow = useStore((s) => s.follow);

  const authors = getSuggestedAuthors().slice(0, 6);
  if (authors.length === 0) return null;

  return (
    <section className="px-4 pb-4">
      <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-3">
        Poetas para seguir
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {authors.map((user) => {
          const following = isFollowing(user.id);
          return (
            <div
              key={user.id}
              className="shrink-0 w-[9.5rem] glass-panel p-3 flex flex-col items-center text-center"
            >
              <Link href={`/profile/${user.username}`}>
                <Avatar
                  name={user.displayName}
                  color={user.avatarColor}
                  imageUrl={user.avatarUrl}
                  size="md"
                />
              </Link>
              <Link href={`/profile/${user.username}`} className="mt-2 min-w-0 w-full">
                <p className="text-sm font-semibold text-ink truncate">{user.displayName}</p>
                <p className="text-[10px] text-ink-dim truncate">@{user.username}</p>
              </Link>
              {!following && currentUserId && user.id !== currentUserId && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 w-full h-8 text-xs"
                  onClick={() => follow(user.id)}
                >
                  Seguir
                </Button>
              )}
              {following && (
                <span className="mt-2 text-[10px] font-medium text-accent">A seguir</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
