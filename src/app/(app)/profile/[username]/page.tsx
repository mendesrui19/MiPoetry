"use client";

import { AppHeader, EmptyState, PageShell } from "@/components/layout/bottom-nav";
import { PoemCard } from "@/components/poem/poem-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { BookOpen, Eye, MessageCircle, Pin, UserMinus, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const router = useRouter();
  const user = useStore((s) => s.users.find((u) => u.username === username));
  const currentUserId = useStore((s) => s.currentUserId);
  const isFollowing = useStore((s) => s.isFollowing);
  const follow = useStore((s) => s.follow);
  const unfollow = useStore((s) => s.unfollow);
  const startConversation = useStore((s) => s.startConversation);
  const getVisiblePoems = useStore((s) => s.getVisiblePoems);
  const pinPoem = useStore((s) => s.pinPoem);
  const unpinPoem = useStore((s) => s.unpinPoem);
  const books = useStore((s) => s.books);
  const follows = useStore((s) => s.follows);

  if (!user) {
    return (
      <PageShell>
        <AppHeader title="Perfil" />
        <EmptyState title="Utilizador não encontrado" description="Este perfil não existe." />
      </PageShell>
    );
  }

  const isOwn = user.id === currentUserId;
  const following = isFollowing(user.id);
  const userPoems = getVisiblePoems(currentUserId).filter((p) => p.authorId === user.id);
  const followers = follows.filter((f) => f.followingId === user.id).length;
  const followingCount = follows.filter((f) => f.followerId === user.id).length;
  const userBooks = books.filter((b) => b.authorId === user.id && (b.isPublic || isOwn));
  const totalViews = userPoems.reduce((sum, p) => sum + p.viewCount, 0);
  const pinnedPoems = user.pinnedPoemIds
    .map((id) => userPoems.find((p) => p.id === id))
    .filter(Boolean);
  const otherPoems = userPoems.filter((p) => !user.pinnedPoemIds.includes(p.id));

  const handleMessage = () => {
    const convId = startConversation(user.id);
    router.push(`/messages?conv=${convId}`);
  };

  return (
    <PageShell>
      <AppHeader title={`@${user.username}`} />

      <div className="px-4 py-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar
            name={user.displayName}
            color={user.avatarColor}
            imageUrl={user.avatarUrl}
            size="lg"
          />
          <div className="flex-1">
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              {user.displayName}
            </h2>
            <p className="text-sm text-ink-dim">@{user.username}</p>
            {user.bio && (
              <p className="text-sm text-ink-muted mt-2 leading-relaxed">{user.bio}</p>
            )}
            {user.styleTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {user.styleTags.map((tag) => (
                  <Badge key={tag} variant="accent">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 mb-4 flex-wrap">
          <div className="text-center min-w-[52px]">
            <p className="text-lg font-semibold">{userPoems.length}</p>
            <p className="text-xs text-ink-dim">Poemas</p>
          </div>
          <div className="text-center min-w-[52px]">
            <p className="text-lg font-semibold flex items-center justify-center gap-1">
              <Eye className="h-3.5 w-3.5 text-ink-dim" />
              {totalViews}
            </p>
            <p className="text-xs text-ink-dim">Leituras</p>
          </div>
          <div className="text-center min-w-[52px]">
            <p className="text-lg font-semibold">{userBooks.length}</p>
            <p className="text-xs text-ink-dim">Livros</p>
          </div>
          <Link
            href={`/profile/follows?tab=followers&user=${user.username}`}
            className="text-center min-w-[52px] active:opacity-70"
          >
            <p className="text-lg font-semibold">{followers}</p>
            <p className="text-xs text-ink-dim">Seguidores</p>
          </Link>
          <Link
            href={`/profile/follows?tab=following&user=${user.username}`}
            className="text-center min-w-[52px] active:opacity-70"
          >
            <p className="text-lg font-semibold">{followingCount}</p>
            <p className="text-xs text-ink-dim">A seguir</p>
          </Link>
        </div>

        {userBooks.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Antologias
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {userBooks.map((b) => (
                <Link
                  key={b.id}
                  href={b.isPublic ? `/book/${b.slug}` : "/books"}
                  className="shrink-0 rounded-xl border border-border px-3 py-2 text-sm hover:bg-surface-up"
                >
                  {b.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {!isOwn && currentUserId && (
          <div className="flex gap-2 mb-4">
            <Button
              className="flex-1"
              variant={following ? "secondary" : "default"}
              onClick={() => (following ? unfollow(user.id) : follow(user.id))}
            >
              {following ? (
                <>
                  <UserMinus className="h-4 w-4" /> A seguir
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> Seguir
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleMessage}>
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {pinnedPoems.length > 0 && (
        <div className="mb-2">
          <p className="px-4 text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Pin className="h-3.5 w-3.5" />
            Fixados
          </p>
          {pinnedPoems.map(
            (poem) =>
              poem && (
                <div key={poem.id} className="relative">
                  <PoemCard poem={poem} />
                  {isOwn && (
                    <button
                      onClick={() => unpinPoem(poem.id)}
                      className="absolute top-3 right-7 text-xs text-accent bg-surface/90 px-2 py-0.5 rounded-lg"
                    >
                      Desafixar
                    </button>
                  )}
                </div>
              )
          )}
        </div>
      )}

      {userPoems.length === 0 ? (
        <EmptyState title="Sem poemas públicos" description="Este autor ainda não publicou nada visível." />
      ) : (
        otherPoems.map((poem) => (
          <div key={poem.id} className="relative">
            <PoemCard poem={poem} />
            {isOwn && !user.pinnedPoemIds.includes(poem.id) && user.pinnedPoemIds.length < 3 && (
              <button
                onClick={() => pinPoem(poem.id)}
                className="absolute top-3 right-7 text-xs text-ink-dim bg-surface/90 px-2 py-0.5 rounded-lg"
              >
                Fixar
              </button>
            )}
          </div>
        ))
      )}
    </PageShell>
  );
}
