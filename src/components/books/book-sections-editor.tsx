"use client";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import {
  BACK_SECTION_TYPES,
  bookSectionTitle,
  BOOK_SECTION_LABELS,
  FRONT_SECTION_TYPES,
  sortBookSections,
} from "@/lib/book-sections";
import type { BookSection, BookSectionType } from "@/lib/types";
import { useStore } from "@/lib/store";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface BookSectionsEditorProps {
  bookId: string;
  sections: BookSection[];
}

function SectionGroup({
  bookId,
  placement,
  label,
  types,
  sections,
}: {
  bookId: string;
  placement: "front" | "back";
  label: string;
  types: BookSectionType[];
  sections: BookSection[];
}) {
  const addBookSection = useStore((s) => s.addBookSection);
  const updateBookSection = useStore((s) => s.updateBookSection);
  const removeBookSection = useStore((s) => s.removeBookSection);
  const reorderBookSections = useStore((s) => s.reorderBookSections);
  const [adding, setAdding] = useState(false);

  const sorted = sortBookSections(sections, placement);

  const move = (sectionId: string, dir: -1 | 1) => {
    const ids = sorted.map((s) => s.id);
    const idx = ids.indexOf(sectionId);
    const next = idx + dir;
    if (idx < 0 || next < 0 || next >= ids.length) return;
    [ids[idx], ids[next]] = [ids[next], ids[idx]];
    reorderBookSections(bookId, placement, ids);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
        {!adding && (
          <Button variant="ghost" size="sm" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        )}
      </div>

      {adding && (
        <div className="rounded-xl border border-border-faint p-3 space-y-2 bg-surface">
          <p className="text-xs text-ink-muted">Escolhe o tipo de secção:</p>
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  addBookSection(bookId, type, placement);
                  setAdding(false);
                }}
                className="text-xs px-3 py-1.5 rounded-full border border-border text-ink-muted hover:border-accent hover:text-accent transition-colors"
              >
                {BOOK_SECTION_LABELS[type]}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>
            Cancelar
          </Button>
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-xs text-ink-dim py-2">
          {placement === "front"
            ? "Dedicação, epígrafe, prefácio… aparecem antes dos poemas."
            : "Agradecimentos, posfácio… aparecem depois dos poemas."}
        </p>
      ) : (
        <div className="space-y-3">
          {sorted.map((section, idx) => (
            <div
              key={section.id}
              className="rounded-xl border border-border bg-surface p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">
                    {bookSectionTitle(section.type, section.title)}
                  </p>
                  {section.type === "custom" && (
                    <Input
                      value={section.title ?? ""}
                      onChange={(e) =>
                        updateBookSection(section.id, { title: e.target.value })
                      }
                      placeholder="Título personalizado..."
                      className="mt-2"
                    />
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => move(section.id, -1)}
                    disabled={idx === 0}
                    className="p-1 rounded disabled:opacity-30"
                    aria-label="Subir"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => move(section.id, 1)}
                    disabled={idx === sorted.length - 1}
                    className="p-1 rounded disabled:opacity-30"
                    aria-label="Descer"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeBookSection(section.id)}
                    className="p-1 rounded text-ink-dim hover:text-red-600"
                    aria-label="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Textarea
                value={section.body}
                onChange={(e) => updateBookSection(section.id, { body: e.target.value })}
                placeholder="Escreve aqui..."
                rows={4}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BookSectionsEditor({ bookId, sections }: BookSectionsEditorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-ink mb-1">Partes do livro</h3>
        <p className="text-xs text-ink-dim">
          Elementos pré-textuais e pós-textuais — como num livro real.
        </p>
      </div>

      <SectionGroup
        bookId={bookId}
        placement="front"
        label="Antes dos poemas"
        types={FRONT_SECTION_TYPES}
        sections={sections}
      />

      <SectionGroup
        bookId={bookId}
        placement="back"
        label="Depois dos poemas"
        types={BACK_SECTION_TYPES}
        sections={sections}
      />
    </div>
  );
}
