"use client";

import { AppHeader, EmptyState, PageShell, StickyHeader } from "@/components/layout/bottom-nav";
import { BookCoverUpload } from "@/components/books/book-cover-upload";
import { BookSectionsEditor } from "@/components/books/book-sections-editor";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { bookSectionTitle, sortBookSections } from "@/lib/book-sections";
import { cn } from "@/lib/cn";
import { bodyPreview } from "@/lib/rich-text";
import { useCurrentUser, useStore } from "@/lib/store";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Download,
  Globe,
  Link2,
  Lock,
  Plus,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { jsPDF } from "jspdf";
import { bodyToPlainText } from "@/lib/rich-text";

type BookTab = "geral" | "partes" | "poemas";

function BooksContent() {
  const user = useCurrentUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const tab = (searchParams.get("tab") as BookTab) || "geral";

  const books = useStore((s) => s.books);
  const poems = useStore((s) => s.poems);
  const createBook = useStore((s) => s.createBook);
  const addPoemToBook = useStore((s) => s.addPoemToBook);
  const removePoemFromBook = useStore((s) => s.removePoemFromBook);
  const reorderBookPoems = useStore((s) => s.reorderBookPoems);
  const toggleBookPublic = useStore((s) => s.toggleBookPublic);
  const setBookCover = useStore((s) => s.setBookCover);

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [copied, setCopied] = useState(false);

  if (!user) {
    return (
      <PageShell>
        <AppHeader title="Livros" />
        <EmptyState
          title="Inicia sessão"
          description="Cria antologias dos teus poemas favoritos."
          action={
            <Link href="/auth/login">
              <Button>Entrar</Button>
            </Link>
          }
        />
      </PageShell>
    );
  }

  const myBooks = books.filter((b) => b.authorId === user.id);
  const myPoems = poems.filter((p) => p.authorId === user.id);
  const book = editId ? myBooks.find((b) => b.id === editId) : null;

  const openBook = (id: string, nextTab: BookTab = "geral") => {
    router.push(`/books?edit=${id}&tab=${nextTab}`);
  };

  const setTab = (nextTab: BookTab) => {
    if (!editId) return;
    router.push(`/books?edit=${editId}&tab=${nextTab}`);
  };

  const exportPdf = (bookId: string) => {
    const b = myBooks.find((bk) => bk.id === bookId);
    if (!b) return;
    const doc = new jsPDF();
    doc.setFont("times");
    doc.setFontSize(22);
    doc.text(b.title, 20, 30);
    doc.setFontSize(11);
    if (b.description) doc.text(b.description, 20, 42);
    let y = 58;

    const addSectionBlock = (sectionTitle: string, sectionBody: string) => {
      if (y > 240) {
        doc.addPage();
        y = 30;
      }
      doc.setFontSize(12);
      doc.text(sectionTitle, 20, y);
      y += 8;
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(sectionBody, 170);
      doc.text(lines, 20, y);
      y += lines.length * 6 + 14;
    };

    sortBookSections(b.sections ?? [], "front").forEach((section) => {
      if (!section.body.trim()) return;
      addSectionBlock(bookSectionTitle(section.type, section.title), section.body);
    });

    b.poemIds.forEach((pid) => {
      const p = poems.find((po) => po.id === pid);
      if (!p) return;
      if (y > 250) {
        doc.addPage();
        y = 30;
      }
      doc.setFontSize(14);
      doc.text(p.title, 20, y);
      y += 10;
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(bodyToPlainText(p.body), 170);
      doc.text(lines, 20, y);
      y += lines.length * 6 + 16;
    });

    sortBookSections(b.sections ?? [], "back").forEach((section) => {
      if (!section.body.trim()) return;
      addSectionBlock(bookSectionTitle(section.type, section.title), section.body);
    });

    doc.save(`${b.slug}.pdf`);
  };

  const shareBook = async (b: (typeof myBooks)[0]) => {
    const url = `${window.location.origin}/book/${b.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: b.title, text: b.description, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const movePoem = (bookId: string, poemId: string, dir: -1 | 1) => {
    const b = myBooks.find((bk) => bk.id === bookId);
    if (!b) return;
    const idx = b.poemIds.indexOf(poemId);
    const next = idx + dir;
    if (idx < 0 || next < 0 || next >= b.poemIds.length) return;
    const ids = [...b.poemIds];
    [ids[idx], ids[next]] = [ids[next], ids[idx]];
    reorderBookPoems(bookId, ids);
  };

  if (book) {
    const bookPoems = book.poemIds
      .map((id) => poems.find((p) => p.id === id))
      .filter(Boolean);
    const availablePoems = myPoems.filter((p) => !book.poemIds.includes(p.id));

    return (
      <PageShell className="page-shell--immersive">
        <StickyHeader className="justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/books" className="p-1 -ml-1 shrink-0" aria-label="Voltar">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-classic text-lg font-semibold truncate">{book.title}</h1>
          </div>
          <div className="flex gap-1 shrink-0">
            {book.isPublic && (
              <button onClick={() => shareBook(book)} className="p-2" aria-label="Partilhar">
                <Share2 className="h-5 w-5 text-accent" />
              </button>
            )}
            <button onClick={() => exportPdf(book.id)} className="p-2" aria-label="Exportar PDF">
              <Download className="h-5 w-5 text-accent" />
            </button>
          </div>
        </StickyHeader>

        <div className="sticky top-[calc(var(--header-height)+var(--safe-top))] z-30 px-4 py-3 bg-paper/95 backdrop-blur-xl border-b border-border-faint">
          <Tabs
            tabs={[
              { id: "geral", label: "Capa" },
              { id: "partes", label: "Partes" },
              { id: "poemas", label: `Poemas (${book.poemIds.length})` },
            ]}
            active={tab}
            onChange={(id) => setTab(id as BookTab)}
          />
        </div>

        <div className="px-4 py-4 pb-6">
          {tab === "geral" && (
            <div className="space-y-6">
              <BookCoverUpload
                userId={user.id}
                bookId={book.id}
                title={book.title}
                coverUrl={book.coverUrl}
                onUploaded={(url) => setBookCover(book.id, url)}
              />
              <p className="text-sm text-ink-muted leading-relaxed">{book.description}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={book.isPublic ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleBookPublic(book.id)}
                >
                  {book.isPublic ? (
                    <>
                      <Globe className="h-4 w-4" /> Público
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" /> Privado
                    </>
                  )}
                </Button>
                {book.isPublic && (
                  <Button variant="outline" size="sm" onClick={() => shareBook(book)}>
                    <Link2 className="h-4 w-4" />
                    {copied ? "Copiado!" : "Copiar link"}
                  </Button>
                )}
                {book.isPublic && (
                  <Link href={`/book/${book.slug}`} target="_blank">
                    <Button variant="outline" size="sm">
                      Ver página
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}

          {tab === "partes" && (
            <BookSectionsEditor bookId={book.id} sections={book.sections ?? []} />
          )}

          {tab === "poemas" && (
            <div className="space-y-4">
              {bookPoems.length === 0 ? (
                <EmptyState title="Sem poemas" description="Adiciona poemas abaixo." />
              ) : (
                <div className="space-y-2">
                  {bookPoems.map(
                    (poem, idx) =>
                      poem && (
                        <div
                          key={poem.id}
                          className="flex items-center gap-2 rounded-xl border border-border-faint bg-surface px-3 py-3"
                        >
                          <div className="flex flex-col gap-0.5 shrink-0">
                            <button
                              onClick={() => movePoem(book.id, poem.id, -1)}
                              disabled={idx === 0}
                              className="p-0.5 rounded disabled:opacity-30"
                              aria-label="Subir"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => movePoem(book.id, poem.id, 1)}
                              disabled={idx === bookPoems.length - 1}
                              className="p-0.5 rounded disabled:opacity-30"
                              aria-label="Descer"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <Link href={`/poem/${poem.id}`} className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink truncate">{poem.title}</p>
                            <p className="text-xs text-ink-dim truncate">
                              {bodyPreview(poem.body, 72)}
                            </p>
                          </Link>
                          <button
                            onClick={() => removePoemFromBook(book.id, poem.id)}
                            className="text-xs text-ink-dim px-2 shrink-0"
                          >
                            Remover
                          </button>
                        </div>
                      )
                  )}
                </div>
              )}

              {availablePoems.length > 0 && (
                <>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted pt-2">
                    Adicionar
                  </h3>
                  <div className="space-y-2">
                    {availablePoems.map((poem) => (
                      <button
                        key={poem.id}
                        onClick={() => addPoemToBook(book.id, poem.id)}
                        className="w-full text-left rounded-xl border border-border-faint px-4 py-3 active:bg-surface transition-colors"
                      >
                        <p className="text-sm font-medium text-ink">{poem.title}</p>
                        <p className="text-xs text-ink-dim truncate">
                          {bodyPreview(poem.body, 80)}
                        </p>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <AppHeader
        title="Antologias"
        action={
          <button onClick={() => setShowCreate(!showCreate)} aria-label="Novo livro">
            <Plus className="h-5 w-5 text-accent" />
          </button>
        }
      />

      {showCreate && (
        <div className="px-4 py-4 border-b border-border-faint space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título..." />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição..."
            rows={2}
          />
          <Button
            onClick={() => {
              if (title.trim()) {
                const id = createBook(title.trim(), description.trim());
                openBook(id);
                setTitle("");
                setDescription("");
                setShowCreate(false);
              }
            }}
          >
            Criar antologia
          </Button>
        </div>
      )}

      {myBooks.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Sem antologias"
          description="Agrupa poemas numa coleção partilhável."
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              Criar antologia
            </Button>
          }
        />
      ) : (
        <div className="divide-y divide-border-faint">
          {myBooks.map((b) => (
            <button
              key={b.id}
              onClick={() => openBook(b.id)}
              className="w-full flex items-center gap-4 px-4 py-4 text-left active:bg-surface transition-colors"
            >
              <div
                className={cn(
                  "h-14 w-10 rounded-lg border flex items-center justify-center shrink-0 overflow-hidden",
                  b.coverUrl ? "" : "bg-accent/15 border-accent/30"
                )}
              >
                {b.coverUrl ? (
                  <img src={b.coverUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <BookOpen className="h-5 w-5 text-accent" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-classic text-base font-semibold text-ink">{b.title}</p>
                <p className="text-xs text-ink-dim">
                  {b.poemIds.length} poemas · {b.isPublic ? "Público" : "Privado"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </PageShell>
  );
}

export default function BooksPage() {
  return (
    <Suspense>
      <BooksContent />
    </Suspense>
  );
}
