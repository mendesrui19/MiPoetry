"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { uploadAvatar } from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

interface AvatarUploadProps {
  userId: string;
  displayName: string;
  avatarColor: string;
  avatarUrl?: string;
  onUploaded: (url: string) => void;
}

export function AvatarUpload({
  userId,
  displayName,
  avatarColor,
  avatarUrl,
  onUploaded,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(avatarUrl);
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
        const url = await uploadAvatar(supabase, userId, file);
        setPreview(url);
        onUploaded(url);
      } else {
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        onUploaded(objectUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar foto.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar
          name={displayName}
          color={avatarColor}
          imageUrl={preview}
          size="lg"
        />
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
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
          {preview ? "Alterar foto" : "Carregar foto"}
        </Button>
        <p className="text-xs text-ink-dim">
          JPG, PNG ou WebP · máx. 5 MB · redimensionada automaticamente
        </p>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
