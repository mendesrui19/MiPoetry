"use client";

import { Button } from "@/components/ui/button";
import { Collapsible } from "@/components/ui/collapsible";
import { PrivacySelector } from "@/components/poem/privacy-badge";
import { RichPoemWritingArea } from "@/components/editor/rich-poem-writing-area";
import { PoemRichBlock } from "@/components/poem/poem-rich-content";
import { DraftVersionsPanel } from "@/components/editor/draft-versions-panel";
import { DEFAULT_POEM_STYLE } from "@/lib/poem-style";
import { getPrivacyOption } from "@/lib/privacy";
import { insertTextAtSelection, normalizePoemTitle } from "@/lib/paste-text";
import { bodyToPlainText } from "@/lib/rich-text";
import { useCurrentUser, useStore } from "@/lib/store";
import type { DraftVersion, FontSize, FontStyle, Privacy, ThemeStyle } from "@/lib/types";
import { Check, Eye, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const AUTOSAVE_MS = 1500;

interface PoemEditorProps {
  draftId?: string;
  poemId?: string;
  initial?: {
    title: string;
    body: string;
    font: FontStyle;
    theme: ThemeStyle;
    textColor?: string;
    fontSize?: FontSize;
    privacy: Privacy;
  };
}

export function PoemEditor({ draftId: initialDraftId, poemId, initial }: PoemEditorProps) {
  const router = useRouter();
  const user = useCurrentUser();
  const saveDraft = useStore((s) => s.saveDraft);
  const publishPoem = useStore((s) => s.publishPoem);
  const updatePoem = useStore((s) => s.updatePoem);
  const currentUserId = useStore((s) => s.currentUserId);
  const isEditing = Boolean(poemId);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [font, setFont] = useState<FontStyle>(initial?.font ?? DEFAULT_POEM_STYLE.font);
  const [theme, setTheme] = useState<ThemeStyle>(initial?.theme ?? DEFAULT_POEM_STYLE.theme);
  const [textColor, setTextColor] = useState(initial?.textColor ?? DEFAULT_POEM_STYLE.textColor);
  const [fontSize, setFontSize] = useState<FontSize>(initial?.fontSize ?? DEFAULT_POEM_STYLE.fontSize);
  const [privacy, setPrivacy] = useState<Privacy>(initial?.privacy ?? "public");
  const [draftId, setDraftId] = useState(initialDraftId);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [publishing, setPublishing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const plainBody = bodyToPlainText(body);
  const lineCount = plainBody.trim() ? plainBody.split("\n").length : 0;
  const wordCount = plainBody.trim() ? plainBody.trim().split(/\s+/).length : 0;
  const privacyOption = getPrivacyOption(privacy);

  const persistDraft = useCallback(() => {
    if (!currentUserId || isEditing) return;
    const id = saveDraft({
      id: draftId,
      title,
      body,
      font,
      theme,
      textColor,
      fontSize,
      privacy,
    });
    setDraftId(id);
    setSavedAt(new Date());
  }, [currentUserId, isEditing, draftId, title, body, font, theme, textColor, fontSize, privacy, saveDraft]);

  const persistEdit = useCallback(() => {
    if (!currentUserId || !isEditing || !poemId) return;
    updatePoem(poemId, { title, body, font, theme, textColor, fontSize, privacy });
    setSavedAt(new Date());
  }, [currentUserId, isEditing, poemId, title, body, font, theme, textColor, fontSize, privacy, updatePoem]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(isEditing ? persistEdit : persistDraft, AUTOSAVE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [title, body, font, theme, textColor, fontSize, privacy, isEditing, persistDraft, persistEdit]);

  const handlePublish = () => {
    if (!plainBody.trim()) return;
    setPublishing(true);
    const payload = { title, body, font, theme, textColor, fontSize, privacy };
    if (isEditing && poemId) {
      const ok = updatePoem(poemId, payload);
      if (ok) router.push(`/poem/${poemId}`);
    } else {
      const id = publishPoem(draftId ?? null, payload);
      if (id) router.push(`/poem/${id}`);
    }
    setPublishing(false);
  };

  const handleTitlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const plain = e.clipboardData.getData("text/plain");
      if (!plain) return;
      e.preventDefault();
      const normalized = normalizePoemTitle(plain);
      const input = e.currentTarget;
      const { value, cursor } = insertTextAtSelection(input, title, normalized);
      setTitle(value);
      requestAnimationFrame(() => input.setSelectionRange(cursor, cursor));
    },
    [title]
  );

  if (!currentUserId) {
    return (
      <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
        <p className="text-ink-muted mb-4">Inicia sessão para escrever poemas.</p>
        <Button onClick={() => router.push("/auth/login")}>Entrar</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-var(--safe-top))] pb-[calc(var(--safe-bottom)+0.5rem)]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-faint bg-surface/80 shrink-0">
        <span className="text-xs text-ink-dim">
          {lineCount > 0 && `${lineCount} linhas · `}
          {wordCount > 0 && `${wordCount} palavras`}
        </span>
        {savedAt && (
          <span className="flex items-center gap-1 text-xs text-accent">
            <Check className="h-3 w-3" />
            Guardado
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <RichPoemWritingArea
          title={title}
          onTitleChange={setTitle}
          body={body}
          onBodyChange={setBody}
          font={font}
          theme={theme}
          textColor={textColor}
          fontSize={fontSize}
          onThemeChange={setTheme}
          onTextColorChange={setTextColor}
          onTitlePaste={handleTitlePaste}
        />

        <Collapsible title="Pré-visualização" icon={<Eye className="h-3.5 w-3.5 text-ink-dim" />}>
          <PoemRichBlock
            title={title}
            body={body}
            font={font}
            theme={theme}
            textColor={textColor}
            fontSize={fontSize}
            authorName={user?.displayName}
          />
        </Collapsible>

        {!isEditing && draftId && (
          <Collapsible
            title="Versões"
            icon={<History className="h-3.5 w-3.5 text-ink-dim" />}
            badge="auto"
          >
            <DraftVersionsPanel
              draftId={draftId}
              embedded
              onRestore={(v: DraftVersion) => {
                setTitle(v.title);
                setBody(v.body);
                setFont(v.font);
                setTheme(v.theme);
                setTextColor(v.textColor);
                setFontSize(v.fontSize);
              }}
            />
          </Collapsible>
        )}
      </div>

      <div className="shrink-0 border-t border-border-faint bg-surface/95 backdrop-blur-xl px-4 py-3 space-y-3 safe-bottom">
        <PrivacySelector value={privacy} onChange={setPrivacy} compact />
        <div className="flex gap-2">
          {!isEditing && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={persistDraft}
              disabled={!plainBody.trim() && !title.trim()}
            >
              Rascunho
            </Button>
          )}
          <Button className="flex-1" onClick={handlePublish} disabled={!plainBody.trim() || publishing}>
            {isEditing ? "Guardar" : `Publicar · ${privacyOption.shortLabel}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
