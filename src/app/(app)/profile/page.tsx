"use client";

import { AppHeader, EmptyState, PageShell } from "@/components/layout/bottom-nav";
import { PoemCard } from "@/components/poem/poem-card";
import { DraftActions } from "@/components/poem/poem-author-menu";
import { ProfileWriterSection } from "@/components/studio/profile-writer-section";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { useCurrentUser, useStore } from "@/lib/store";
import {
  Bookmark,
  BookOpen,
  ChevronRight,
  FileText,
  LogOut,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ProfileContent() {
  const user = useCurrentUser();
  const currentUserId = useStore((s) => s.currentUserId);
  const drafts = useStore((s) => s.drafts);
  const poems = useStore((s) => s.poems);
  const logout = useStore((s) => s.logout);
  const getFollowers = useStore((s) => s.getFollowers);
  const getFollowing = useStore((s) => s.getFollowing);
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") ?? "all";
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    setTab(searchParams.get("tab") ?? "all");
  }, [searchParams]);

  if (!user || !currentUserId) {
    return (
      <PageShell>
        <AppHeader title="Perfil" />
        <EmptyState
          title="Não tens sessão iniciada"
          description="Entra ou cria conta para acederes ao teu perfil."
          action={
            <Link href="/auth/login">
              <Button>Entrar</Button>
            </Link>
          }
        />
      </PageShell>
    );
  }

  const myPoems = poems.filter((p) => p.authorId === currentUserId);
  const myDrafts = drafts.filter((d) => d.authorId === currentUserId);
  const followers = getFollowers(currentUserId).length;
  const following = getFollowing(currentUserId).length;

  const filteredPoems =
    tab === "public"
      ? myPoems.filter((p) => p.privacy === "public")
      : tab === "private"
        ? myPoems.filter((p) => p.privacy === "private")
        : tab === "followers"
          ? myPoems.filter((p) => p.privacy === "followers")
          : myPoems;

  return (
    <PageShell>
      <AppHeader
        title="Perfil"
        action={
          <Link href="/settings">
            <Settings className="h-5 w-5 text-ink-muted" />
          </Link>
        }
      />

      <div className="px-4 py-6">
        <div className="flex items-start gap-4 mb-6">
          <Avatar name={user.displayName} color={user.avatarColor} size="lg" />
          <div className="flex-1">
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">{user.displayName}</h2>
            <p className="text-sm text-ink-dim">@{user.username}</p>
            {user.bio && (
              <p className="text-sm text-ink-muted mt-2 leading-relaxed">{user.bio}</p>
            )}
          </div>
        </div>

        <ProfileWriterSection />

        <div className="flex gap-4 mb-6 justify-center">
          <Stat label="Poemas" value={myPoems.length} />
          <Stat
            label="Seguidores"
            value={followers}
            href="/profile/follows?tab=followers"
          />
          <Stat
            label="A seguir"
            value={following}
            href="/profile/follows?tab=following"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <MenuLink href="/saved" icon={Bookmark} label="Guardados" />
          <MenuLink href="/books" icon={BookOpen} label="Livros" />
          <MenuLink href="/write" icon={FileText} label="Escrever" />
        </div>

        <div className="mb-4">
          <Tabs
            tabs={[
              { id: "all", label: "Todos" },
              { id: "public", label: "Públicos" },
              { id: "followers", label: "Amigos" },
              { id: "private", label: "Diário" },
              { id: "drafts", label: `Rascunhos${myDrafts.length ? ` (${myDrafts.length})` : ""}` },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>
      </div>

      {tab === "drafts" ? (
        myDrafts.length === 0 ? (
          <EmptyState
            title="Sem rascunhos"
            description="Os teus textos a meio ficam guardados aqui automaticamente."
            action={
              <Link href="/write">
                <Button>Escrever</Button>
              </Link>
            }
          />
        ) : (
          <div className="px-4 space-y-2 pb-4">
            {myDrafts.map((draft) => (
              <div
                key={draft.id}
                className="flex items-center gap-2 rounded-xl border border-border-faint bg-surface"
              >
                <Link
                  href={`/write?draft=${draft.id}`}
                  className="flex flex-1 items-center justify-between px-4 py-3 min-w-0 active:bg-surface-up transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">
                      {draft.title || "Sem título"}
                    </p>
                    <p className="text-xs text-ink-dim truncate">
                      {draft.body.slice(0, 80) || "Vazio..."}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink-dim shrink-0" />
                </Link>
                <DraftActions draftId={draft.id} />
              </div>
            ))}
          </div>
        )
      ) : filteredPoems.length === 0 ? (
        <EmptyState
          title={
            tab === "private"
              ? "Diário vazio"
              : tab === "followers"
                ? "Nada para amigos"
                : tab === "public"
                  ? "Nada publicado"
                  : "Ainda sem poemas"
          }
          description={
            tab === "private"
              ? "Escreve poemas privados — só tu os vês."
              : tab === "followers"
                ? "Publica poemas visíveis só para quem te segue."
                : "Escreve o teu primeiro verso."
          }
          action={
            <Link href="/write">
              <Button>Começar a escrever</Button>
            </Link>
          }
        />
      ) : (
        filteredPoems.map((poem) => <PoemCard key={poem.id} poem={poem} showPrivacy />)
      )}

      <div className="px-4 py-6">
        <Button variant="ghost" className="w-full text-ink-muted" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Terminar sessão
        </Button>
      </div>
    </PageShell>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const content = (
    <>
      <p className="text-lg font-semibold text-ink">{value}</p>
      <p className="text-xs text-ink-dim">{label}</p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="text-center flex-1 py-1 rounded-xl active:bg-surface transition-colors">
        {content}
      </Link>
    );
  }

  return <div className="text-center flex-1">{content}</div>;
}

function MenuLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 rounded-xl border border-border-faint bg-surface py-4 active:bg-surface-up transition-colors"
    >
      <Icon className="h-5 w-5 text-accent" />
      <span className="text-xs font-medium text-ink-muted">{label}</span>
    </Link>
  );
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileContent />
    </Suspense>
  );
}
