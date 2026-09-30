"use client";

import { AppHeader, PageShell } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { CloudSyncStatus } from "@/components/settings/cloud-sync-status";
import { PushSettings } from "@/components/settings/push-settings";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useCurrentUser, useStore } from "@/lib/store";
import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STYLE_TAG_OPTIONS = [
  "haiku", "urbano", "melancolia", "amor", "natureza", "cidade",
  "free verse", "soneto", "experimental", "diário",
];

export default function SettingsPage() {
  const user = useCurrentUser();
  const updateProfile = useStore((s) => s.updateProfile);
  const resetDemo = useStore((s) => s.resetDemo);
  const cloudMode = isSupabaseConfigured();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [styleTags, setStyleTags] = useState<string[]>(user?.styleTags ?? []);
  const [saved, setSaved] = useState(false);

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  const toggleTag = (tag: string) => {
    setStyleTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 5 ? [...prev, tag] : prev
    );
  };

  const handleSave = () => {
    updateProfile({ displayName, bio, avatarUrl: avatarUrl || undefined, styleTags });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <PageShell>
      <AppHeader title="Definições" />

      <div className="px-4 py-6 space-y-6">
        <CloudSyncStatus />

        <div>
          <label className="text-xs font-medium text-ink-muted mb-3 block">Foto de perfil</label>
          <AvatarUpload
            userId={user.id}
            displayName={displayName || user.displayName}
            avatarColor={user.avatarColor}
            avatarUrl={avatarUrl || undefined}
            onUploaded={(url) => {
              setAvatarUrl(url);
              updateProfile({ avatarUrl: url });
            }}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-ink-muted mb-1.5 block">Nome a mostrar</label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>

        <div>
          <label className="text-xs font-medium text-ink-muted mb-1.5 block">Bio</label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Conta algo sobre ti..."
          />
        </div>

        <div>
          <label className="text-xs font-medium text-ink-muted mb-2 block">
            Estilo poético (até 5)
          </label>
          <div className="flex flex-wrap gap-2">
            {STYLE_TAG_OPTIONS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  styleTags.includes(tag)
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border text-ink-muted"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          {saved ? "Guardado!" : "Guardar alterações"}
        </Button>

        <div className="border-t border-border-faint pt-6">
          <PushSettings />
        </div>

        <div className="border-t border-border-faint pt-6 space-y-3">
          <p className="text-xs text-ink-dim">
            MiPoetry funciona offline — escreves sem net e sincroniza depois.
          </p>
          <Link href="/saved">
            <Button variant="outline" className="w-full">
              Poemas guardados (offline)
            </Button>
          </Link>
          {!cloudMode && (
            <Button
              variant="ghost"
              className="w-full text-ink-dim"
              onClick={() => {
                if (confirm("Repor dados de demonstração? Perderás alterações locais.")) {
                  resetDemo();
                }
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Repor demo
            </Button>
          )}
        </div>
      </div>
    </PageShell>
  );
}
