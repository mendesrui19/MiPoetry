"use client";

import { EmptyState, PageShell, StickyHeader } from "@/components/layout/bottom-nav";
import { BookReader } from "@/components/books/book-reader";
import { Button } from "@/components/ui/button";
import { useStore, useUser } from "@/lib/store";
import type { Poem } from "@/lib/types";
import { ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";

function getBookPoems(
  poemIds: string[],
  poems: Poem[],
  viewerId: string | null
): Poem[] {
  return poemIds
    .map((id) => poems.find((p) => p.id === id))
    .filter((p): p is Poem => {
      if (!p) return false;
      if (p.privacy === "private") return p.authorId === viewerId;
      return true;
    });
}

export default function PublicBookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const books = useStore((s) => s.books);
  const poems = useStore((s) => s.poems);
  const currentUserId = useStore((s) => s.currentUserId);
  const [copied, setCopied] = useState(false);

  const book = books.find((b) => b.slug === slug && b.isPublic);
  const author = useUser(book?.authorId ?? "");
  const bookPoems = book ? getBookPoems(book.poemIds, poems, currentUserId) : [];

  if (!book || !author) {
    return (
      <PageShell className="page-shell--immersive">
        <EmptyState title="Antologia não encontrada" description="Este livro não existe ou é privado." />
      </PageShell>
    );
  }

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/book/${book.slug}` : `/book/${book.slug}`;

  const handleShare = async () => {
    const data = { title: book.title, text: book.description, url: shareUrl };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        /* cancelled */
      }
    }
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageShell className="page-shell--immersive bg-parchment">
      <StickyHeader className="justify-between bg-parchment/90">
        <Link href="/search" className="p-1 -ml-1" aria-label="Voltar">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <p className="font-classic text-sm text-ink-muted truncate max-w-[50%]">{book.title}</p>
        <button
          type="button"
          onClick={handleShare}
          className="p-2 rounded-xl text-ink-muted hover:bg-surface-up"
          aria-label="Partilhar"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </StickyHeader>

      <div className="px-4 pb-10">
        <BookReader book={book} author={author} poems={bookPoems} />

        <Button variant="outline" className="w-full mt-8" onClick={handleShare}>
          {copied ? "Link copiado!" : "Partilhar antologia"}
        </Button>
      </div>
    </PageShell>
  );
}
