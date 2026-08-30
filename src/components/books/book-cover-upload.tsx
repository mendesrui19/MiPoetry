"use client";

import { Button } from "@/components/ui/button";
import { uploadBookCover } from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cn } from "@/lib/cn";
import { BookOpen, Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

interface BookCoverUploadProps {
  userId: string;
  bookId: string;
  title: string;
  coverUrl?: string;
  onUploaded: (url: string) => void;
}

export function BookCoverUpload({
  userId,
  bookId,
  title,
  coverUrl,
  onUploaded,
}: BookCoverUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(coverUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Escolhe uma imagem (JPG, PNG ou WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5 MB.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const url = await uploadBookCover(supabase, userId, bookId, file);
        setPreview(url);
        onUploaded(url);
      } else {
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        onUploaded(objectUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar capa.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative aspect-[2/3] max-w-[160px] rounded-xl border overflow-hidden",
          preview ? "border-border" : "border-dashed border-accent/40 bg-accent/5"
        )}
      >
        {preview ? (
          <img src={preview} alt={`Capa de ${title}`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
            <BookOpen className="h-8 w-8 text-accent/60" />
            <p className="text-xs text-ink-dim">Sem capa</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        <Camera className="h-4 w-4" />
        {preview ? "Alterar capa" : "Carregar capa"}
      </Button>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
