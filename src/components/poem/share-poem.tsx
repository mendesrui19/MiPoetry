"use client";

import { Button } from "@/components/ui/button";
import type { Poem } from "@/lib/types";
import { bodyToPlainText } from "@/lib/rich-text";
import { toast } from "@/lib/toast";
import { Check, Link2, Share2 } from "lucide-react";
import { useState } from "react";

export function SharePoem({ poem }: { poem: Poem }) {
  const [copied, setCopied] = useState(false);

  const getUrl = () =>
    typeof window !== "undefined"
      ? `${window.location.origin}/poem/${poem.id}`
      : `/poem/${poem.id}`;

  const handleShare = async () => {
    const url = getUrl();
    const shareData = {
      title: poem.title,
      text: bodyToPlainText(poem.body),
      url,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        /* user cancelled */
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare}>
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Link copiado
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          Partilhar
        </>
      )}
    </Button>
  );
}

export function CopyPoemLink({ poemId }: { poemId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/poem/${poemId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-ink-muted hover:bg-surface transition-colors"
      aria-label="Copiar link"
    >
      {copied ? <Check className="h-4 w-4 text-accent" /> : <Link2 className="h-4 w-4" />}
    </button>
  );
}
