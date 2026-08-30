"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import { Bookmark, X } from "lucide-react";
import { useState } from "react";

interface BookmarkSheetProps {
  poemId: string;
  open: boolean;
  onClose: () => void;
}

export function BookmarkSheet({ poemId, open, onClose }: BookmarkSheetProps) {
  const currentUserId = useStore((s) => s.currentUserId);
  const collections = useStore((s) => s.bookmarkCollections);
  const setBookmarkCollection = useStore((s) => s.setBookmarkCollection);
  const removeBookmark = useStore((s) => s.removeBookmark);
  const getBookmarkCollectionId = useStore((s) => s.getBookmarkCollectionId);
  const createCollection = useStore((s) => s.createCollection);
  const [newName, setNewName] = useState("");

  if (!open || !currentUserId) return null;

  const myCollections = collections.filter((c) => c.userId === currentUserId);
  const activeCollectionId = getBookmarkCollectionId(poemId);

  const handleSelect = (collectionId: string) => {
    if (activeCollectionId === collectionId) {
      removeBookmark(poemId);
    } else {
      setBookmarkCollection(poemId, collectionId);
    }
    onClose();
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = createCollection(newName.trim());
    setBookmarkCollection(poemId, id);
    setNewName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <button
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Fechar"
      />
      <div className="relative w-full max-w-lg rounded-t-2xl bg-paper border-t border-border safe-bottom">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border-faint">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-accent" />
            <h2 className="font-classic text-lg font-semibold">Guardar poema</h2>
          </div>
          <button onClick={onClose} className="p-1 text-ink-muted" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-3 space-y-1 max-h-[50dvh] overflow-y-auto">
          {myCollections.map((col) => (
            <button
              key={col.id}
              onClick={() => handleSelect(col.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl text-sm transition-colors",
                activeCollectionId === col.id
                  ? "bg-accent/10 text-accent-deep font-medium"
                  : "hover:bg-surface text-ink"
              )}
            >
              {col.name}
              {activeCollectionId === col.id && " · guardado"}
            </button>
          ))}
        </div>

        <div className="px-4 py-4 border-t border-border-faint flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nova coleção..."
            className="flex-1"
          />
          <Button onClick={handleCreate} disabled={!newName.trim()} size="sm">
            Criar
          </Button>
        </div>
      </div>
    </div>
  );
}
