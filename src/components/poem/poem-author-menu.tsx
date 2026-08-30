"use client";

import { useStore } from "@/lib/store";
import type { Poem } from "@/lib/types";
import { Edit3, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PoemAuthorMenu({ poem }: { poem: Poem }) {
  const router = useRouter();
  const currentUserId = useStore((s) => s.currentUserId);
  const deletePoem = useStore((s) => s.deletePoem);
  const [open, setOpen] = useState(false);

  if (!currentUserId || poem.authorId !== currentUserId) return null;

  const handleDelete = () => {
    if (!confirm("Apagar este poema? Esta ação não pode ser desfeita.")) return;
    deletePoem(poem.id);
    router.push("/profile");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-xl text-ink-muted hover:bg-surface transition-colors"
        aria-label="Opções do poema"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          />
          <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-border-faint bg-paper shadow-lg py-1">
            <Link
              href={`/write?edit=${poem.id}`}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-surface transition-colors"
              onClick={() => setOpen(false)}
            >
              <Edit3 className="h-4 w-4" />
              Editar
            </Link>
            <button
              onClick={handleDelete}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-surface transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Apagar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function DraftActions({
  draftId,
  onDeleted,
}: {
  draftId: string;
  onDeleted?: () => void;
}) {
  const deleteDraft = useStore((s) => s.deleteDraft);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Apagar este rascunho?")) return;
    deleteDraft(draftId);
    onDeleted?.();
  };

  return (
    <button
      onClick={handleDelete}
      className="p-2 text-ink-dim hover:text-red-600 transition-colors"
      aria-label="Apagar rascunho"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
