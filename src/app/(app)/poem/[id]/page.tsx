"use client";

import { AppHeader, PageShell, StickyHeader } from "@/components/layout/bottom-nav";
import { CommentSection } from "@/components/poem/comments";
import { ExportPoemImage } from "@/components/poem/export-image";
import { PoemAudioPlayer, PoemAudioRecorder } from "@/components/poem/poem-audio-recorder";
import { PoemActions } from "@/components/poem/poem-actions";
import { PoemAuthorMenu } from "@/components/poem/poem-author-menu";
import { SharePoem } from "@/components/poem/share-poem";
import { PrivacyBadge } from "@/components/poem/privacy-badge";
import { getPrivacyOption, canSharePoem } from "@/lib/privacy";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { usePoem, useStore, useUser } from "@/lib/store";
import { cn, resolvePoemStyle } from "@/lib/cn";
import { PoemRichContent, PoemRichBlock } from "@/components/poem/poem-rich-content";
import { RelativeTime } from "@/components/ui/relative-time";
import { ArrowLeft, Eye, Maximize2, Minimize2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";

export default function PoemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const poem = usePoem(id);
  const author = useUser(poem?.authorId ?? "");
  const router = useRouter();
  const currentUserId = useStore((s) => s.currentUserId);
  const getVisiblePoems = useStore((s) => s.getVisiblePoems);
  const incrementViewCount = useStore((s) => s.incrementViewCount);
  const [readingMode, setReadingMode] = useState(false);
  const viewedRef = useRef(false);

  useEffect(() => {
    if (poem && !viewedRef.current) {
      incrementViewCount(poem.id);
      viewedRef.current = true;
    }
  }, [poem, incrementViewCount]);

  if (!poem) {
    return (
      <PageShell>
        <AppHeader title="Poema" />
        <p className="text-center text-ink-muted py-20">Poema não encontrado.</p>
      </PageShell>
    );
  }

  const visible = getVisiblePoems(currentUserId).some((p) => p.id === poem.id);
  if (!visible) {
    return (
      <PageShell>
        <AppHeader title="Poema" />
        <p className="text-center text-ink-muted py-20">Este poema não está disponível.</p>
      </PageShell>
    );
  }

  const style = resolvePoemStyle(poem);
  const isAuthor = poem.authorId === currentUserId;

  if (readingMode) {
    return (
      <div className="fixed inset-0 z-50 bg-paper safe-top safe-bottom overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-8 min-h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setReadingMode(false)}
              className="p-2 rounded-xl text-ink-muted hover:bg-surface"
              aria-label="Sair do modo leitura"
            >
              <Minimize2 className="h-5 w-5" />
            </button>
            {author && (
              <span className="text-sm text-ink-dim">— {author.displayName}</span>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h1
              className={cn("text-3xl font-semibold mb-8 text-center", style.fontClassName)}
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
              className={cn("leading-loose", style.fontSizeClassName)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageShell>
      <StickyHeader className="justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => router.back()} className="p-1 -ml-1 shrink-0" aria-label="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="font-display text-base font-semibold tracking-tight truncate">{poem.title}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setReadingMode(true)}
            className="p-2 rounded-xl text-ink-muted hover:bg-surface"
            aria-label="Modo leitura"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <PoemAuthorMenu poem={poem} />
        </div>
      </StickyHeader>

      <article className="px-4 py-6">
        {author && (
          <Link href={`/profile/${author.username}`} className="flex items-start gap-3 mb-4">
            <Avatar
              name={author.displayName}
              color={author.avatarColor}
              imageUrl={author.avatarUrl}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink">{author.displayName}</p>
              <p className="text-xs text-ink-dim">
                @{author.username} · <RelativeTime date={poem.createdAt} />
              </p>
              {author.bio && (
                <p className="text-sm text-ink-muted mt-2 leading-relaxed line-clamp-3">{author.bio}</p>
              )}
            </div>
            <PrivacyBadge privacy={poem.privacy} showLabel size="md" />
          </Link>
        )}

        {!isAuthor && poem.privacy === "followers" && (
          <p className="text-xs text-accent mb-4 px-3 py-2 rounded-xl bg-accent-soft border border-accent/10">
            Poema partilhado só com amigos — visível porque segues {author?.displayName}.
          </p>
        )}

        <PoemRichBlock
          title={poem.title}
          body={poem.body}
          font={poem.font}
          theme={poem.theme}
          textColor={poem.textColor}
          fontSize={poem.fontSize}
          className="mb-4"
          bodyClassName="text-lg leading-relaxed"
        />

        {poem.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {poem.hashtags.map((tag) => (
              <Link key={tag} href={`/search?q=${tag}`}>
                <Badge variant="accent">#{tag}</Badge>
              </Link>
            ))}
          </div>
        )}

        {poem.audioUrl && !isAuthor && (
          <div className="mb-4">
            <PoemAudioPlayer audioUrl={poem.audioUrl} />
          </div>
        )}

        {isAuthor && (
          <div className="mb-4">
            <PoemAudioRecorder poemId={poem.id} audioUrl={poem.audioUrl} />
          </div>
        )}

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {canSharePoem(poem.privacy) ? (
            <SharePoem poem={poem} />
          ) : (
            <p className="text-xs text-ink-dim px-3 py-2 rounded-xl bg-surface border border-border-faint">
              {poem.privacy === "private"
                ? "Poema privado — não pode ser partilhado."
                : "Só amigos podem ver — o link não funciona para outros."}
            </p>
          )}
          <ExportPoemImage poem={poem} />
          <span className="flex items-center gap-1 text-xs text-ink-dim ml-auto">
            <Eye className="h-3.5 w-3.5" />
            {poem.viewCount} leituras
          </span>
        </div>

        {isAuthor && (
          <p className="text-xs text-ink-dim mb-4 px-3 py-2 rounded-xl bg-surface border border-border-faint">
            {getPrivacyOption(poem.privacy).description}.
            {poem.privacy === "private"
              ? " Usa como diário pessoal."
              : poem.privacy === "followers"
                ? " Só aparece no feed de quem te segue."
                : " Aparece no feed de todos."}
            {" "}
            <Link href={`/write?edit=${poem.id}`} className="text-accent font-medium">
              Alterar privacidade
            </Link>
          </p>
        )}
      </article>

      <PoemActions poem={poem} />
      <CommentSection poemId={poem.id} />
    </PageShell>
  );
}
