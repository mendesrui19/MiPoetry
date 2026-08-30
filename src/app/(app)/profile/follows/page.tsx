"use client";

import { AppHeader, EmptyState, PageShell } from "@/components/layout/bottom-nav";
import { Avatar } from "@/components/ui/avatar";
import { Tabs } from "@/components/ui/tabs";
import { useCurrentUser, useStore } from "@/lib/store";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function FollowsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "following" ? "following" : "followers";
  const usernameParam = searchParams.get("user");
  const [tab, setTab] = useState(initialTab);
  const currentUser = useCurrentUser();
  const users = useStore((s) => s.users);
  const profileUser = usernameParam
    ? users.find((u) => u.username === usernameParam)
    : currentUser;
  const getFollowers = useStore((s) => s.getFollowers);
  const getFollowing = useStore((s) => s.getFollowing);
  const isFollowing = useStore((s) => s.isFollowing);
  const follow = useStore((s) => s.follow);
  const unfollow = useStore((s) => s.unfollow);

  if (!profileUser) {
    return (
      <EmptyState
        title="Utilizador não encontrado"
        description="Este perfil não existe."
      />
    );
  }

  const list = tab === "followers" ? getFollowers(profileUser.id) : getFollowing(profileUser.id);

  return (
    <>
      <div className="px-4 py-3">
        <Tabs
          tabs={[
            { id: "followers", label: "Seguidores" },
            { id: "following", label: "A seguir" },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {list.length === 0 ? (
        <EmptyState
          title={tab === "followers" ? "Sem seguidores" : "Não segues ninguém"}
          description={
            tab === "followers"
              ? "Quando alguém te seguir, aparece aqui."
              : "Explora autores e segue os que te inspiram."
          }
          action={
            tab === "following" ? (
              <Link href="/search" className="text-sm text-accent font-medium">
                Descobrir autores
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="divide-y divide-border-faint">
          {list.map((person) => {
            const following = isFollowing(person.id);
            const isSelf = person.id === currentUser?.id;
            return (
              <div key={person.id} className="flex items-center gap-3 px-4 py-3">
                <Link href={`/profile/${person.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar name={person.displayName} color={person.avatarColor} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{person.displayName}</p>
                    <p className="text-xs text-ink-dim">@{person.username}</p>
                  </div>
                </Link>
                {!isSelf && (
                  <button
                    onClick={() => (following ? unfollow(person.id) : follow(person.id))}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      following
                        ? "bg-surface text-ink-muted border border-border"
                        : "bg-accent text-white"
                    }`}
                  >
                    {following ? "A seguir" : "Seguir"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function FollowsPage() {
  return (
    <PageShell>
      <AppHeader title="Comunidade" />
      <Suspense>
        <FollowsContent />
      </Suspense>
    </PageShell>
  );
}
