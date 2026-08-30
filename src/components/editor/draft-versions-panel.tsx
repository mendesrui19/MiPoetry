"use client";

import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import type { DraftVersion } from "@/lib/types";
import { bodyPreview } from "@/lib/rich-text";
import { RotateCcw } from "lucide-react";
import { RelativeTime } from "@/components/ui/relative-time";

export function DraftVersionsPanel({
  draftId,
  onRestore,
  embedded = false,
}: {
  draftId?: string;
  onRestore: (version: DraftVersion) => void;
  embedded?: boolean;
}) {
  const getDraftVersions = useStore((s) => s.getDraftVersions);
  const saveDraftVersion = useStore((s) => s.saveDraftVersion);
  const restoreDraftVersion = useStore((s) => s.restoreDraftVersion);

  if (!draftId) return null;

  const versions = getDraftVersions(draftId);

  return (
    <div className={embedded ? "" : "border-t border-border-faint px-4 py-3"}>
      {!embedded && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide">
            Versões ({versions.length})
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => saveDraftVersion(draftId, "Manual")}
          >
            Guardar versão
          </Button>
        </div>
      )}

      {embedded && (
        <div className="flex justify-end mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => saveDraftVersion(draftId, "Manual")}
          >
            Guardar versão
          </Button>
        </div>
      )}

      {versions.length === 0 ? (
        <p className="text-xs text-ink-dim">Guardadas automaticamente enquanto escreves.</p>
      ) : (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {versions.slice(0, 8).map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => {
                restoreDraftVersion(draftId, v.id);
                onRestore(v);
              }}
              className="w-full text-left rounded-lg border border-border-faint px-3 py-2 hover:bg-surface-up transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-ink truncate">
                  {v.label || v.title || "Sem título"}
                </span>
                <RotateCcw className="h-3 w-3 text-ink-dim shrink-0" />
              </div>
              <p className="text-[10px] text-ink-dim truncate mt-0.5">
                {bodyPreview(v.body, 60)}
              </p>
              <RelativeTime date={v.createdAt} className="text-[10px] text-ink-dim" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
