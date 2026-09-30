"use client";

import { AppHeader, EmptyState, PageShell } from "@/components/layout/bottom-nav";
import { PoemCard } from "@/components/poem/poem-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser, useStore } from "@/lib/store";
import { Bookmark, FolderPlus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SavedPage() {
  const user = useCurrentUser();
  const bookmarkCollections = useStore((s) => s.bookmarkCollections);
  const bookmarks = useStore((s) => s.bookmarks);
  const poems = useStore((s) => s.poems);
  const createCollection = useStore((s) => s.createCollection);
  const renameCollection = useStore((s) => s.renameCollection);
  const deleteCollection = useStore((s) => s.deleteCollection);
  const [newCollection, setNewCollection] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  if (!user) {
    return (
      <PageShell>
        <AppHeader title="Guardados" />
        <EmptyState
          title="Inicia sessão"
          description="Precisas de entrar para ver os teus poemas guardados."
          action={
            <Link href="/auth/login">
              <Button>Entrar</Button>
            </Link>
          }
        />
      </PageShell>
    );
  }

  const myCollections = bookmarkCollections.filter((c) => c.userId === user.id);

  const savedPoems = activeCollection
    ? bookmarks
        .filter((b) => b.collectionId === activeCollection)
        .map((b) => poems.find((p) => p.id === b.poemId))
        .filter(Boolean)
    : bookmarks
        .filter((b) => myCollections.some((c) => c.id === b.collectionId))
        .map((b) => poems.find((p) => p.id === b.poemId))
        .filter(Boolean);

  return (
    <PageShell>
      <AppHeader
        title="Guardados"
        action={
          <button onClick={() => setShowNew(!showNew)} aria-label="Nova coleção">
            <FolderPlus className="h-5 w-5 text-accent" />
          </button>
        }
      />

      {showNew && (
        <div className="px-4 py-3 flex gap-2 border-b border-border-faint">
          <Input
            value={newCollection}
            onChange={(e) => setNewCollection(e.target.value)}
            placeholder="Nome da coleção..."
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={() => {
              if (newCollection.trim()) {
                createCollection(newCollection.trim());
                setNewCollection("");
                setShowNew(false);
              }
            }}
          >
            Criar
          </Button>
        </div>
      )}

      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        <button
          onClick={() => setActiveCollection(null)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm border transition-colors ${
            !activeCollection
              ? "bg-accent text-white border-accent"
              : "border-border text-ink-muted"
          }`}
        >
          Todos
        </button>
        {myCollections.map((col) => (
          <button
            key={col.id}
            onClick={() => setActiveCollection(col.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm border transition-colors ${
              activeCollection === col.id
                ? "bg-accent text-white border-accent"
                : "border-border text-ink-muted"
            }`}
          >
            {col.name}
          </button>
        ))}
      </div>

      {activeCollection && (
        <div className="px-4 pb-3 flex gap-2 items-center">
          <Input
            value={editingName || myCollections.find((c) => c.id === activeCollection)?.name || ""}
            onChange={(e) => setEditingName(e.target.value)}
            onBlur={() => {
              if (editingName.trim()) renameCollection(activeCollection, editingName.trim());
              setEditingName("");
            }}
            className="flex-1 text-sm"
            placeholder="Nome da coleção"
          />
          <button
            onClick={() => {
              if (confirm("Apagar esta coleção? Os poemas deixam de estar guardados nela.")) {
                deleteCollection(activeCollection);
                setActiveCollection(null);
              }
            }}
            className="p-2 text-ink-dim hover:text-red-600"
            aria-label="Apagar coleção"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {savedPoems.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Nada guardado"
          description="Guarda poemas para leres offline mais tarde."
          action={
            <Link href="/feed">
              <Button variant="outline">Explorar feed</Button>
            </Link>
          }
        />
      ) : (
        savedPoems.map((poem) => poem && <PoemCard key={poem.id} poem={poem} readContext="saved" />)
      )}
    </PageShell>
  );
}
