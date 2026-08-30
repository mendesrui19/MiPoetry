"use client";

import { getLatestDraft, getWriterStats } from "@/lib/writer-stats";
import { useCurrentUser, useStore } from "@/lib/store";
import { bodyPreview } from "@/lib/rich-text";
import { Eye, Flame, PenLine, Type } from "lucide-react";
import Link from "next/link";

export function ProfileWriterSection() {
  const user = useCurrentUser();
  const poems = useStore((s) => s.poems);
  const drafts = useStore((s) => s.drafts);
  const books = useStore((s) => s.books);

  if (!user) return null;

  const stats = getWriterStats(
    user.id,
    poems,
    drafts,
    books.filter((b) => b.authorId === user.id).length
  );
  const latestDraft = getLatestDraft(user.id, drafts);

  return (
    <div className="space-y-3 mb-6">
      <div className="grid grid-cols-2 gap-2">
        <StatTile icon={Type} label="Palavras" value={stats.totalWords.toLocaleString("pt-PT")} />
        <StatTile icon={PenLine} label="Poemas" value={String(stats.poemCount)} />
        <StatTile icon={Eye} label="Leituras" value={stats.totalReads.toLocaleString("pt-PT")} />
        <StatTile icon={Flame} label="Dias activos" value={String(stats.writingDays)} />
      </div>

      {latestDraft && (
        <Link
          href={`/write?draft=${latestDraft.id}`}
          className="glass-panel block p-4 active:scale-[0.99] transition-transform"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1">
            Continuar a escrever
          </p>
          <p className="text-sm font-medium text-ink truncate">
            {latestDraft.title || "Sem título"}
          </p>
          <p className="text-xs text-ink-dim truncate mt-0.5">
            {bodyPreview(latestDraft.body, 64) || "Rascunho em progresso..."}
          </p>
        </Link>
      )}
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-panel p-3.5">
      <Icon className="h-4 w-4 text-accent/70 mb-2" />
      <p className="text-lg font-semibold text-ink tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-ink-dim">{label}</p>
    </div>
  );
}
