"use client";

import {
  RichFormatToolbar,
  RichPoemBodyEditor,
  type Editor,
} from "@/components/editor/rich-poem-editor";
import { THEME_OPTIONS, getThemeDefaultText, themeClasses } from "@/lib/poem-style";
import { getFontFamily } from "@/lib/poem-fonts";
import { cn } from "@/lib/cn";
import type { FontSize, FontStyle, ThemeStyle } from "@/lib/types";
import { useRef, useState } from "react";

const FONT_SIZE_MAP: Record<FontSize, string> = {
  sm: "0.9375rem",
  md: "1.0625rem",
  lg: "1.25rem",
  xl: "1.5rem",
};

function poemFontToFamily(font: FontStyle): string {
  switch (font) {
    case "sans":
      return getFontFamily("dm-sans");
    case "typewriter":
      return getFontFamily("ibm-mono");
    case "elegant":
    case "classic":
    default:
      return getFontFamily("literata");
  }
}

interface RichPoemWritingAreaProps {
  title: string;
  onTitleChange: (v: string) => void;
  body: string;
  onBodyChange: (html: string) => void;
  font: FontStyle;
  theme: ThemeStyle;
  textColor: string;
  fontSize: FontSize;
  onThemeChange: (t: ThemeStyle) => void;
  onTextColorChange: (c: string) => void;
  onTitlePaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
}

export function RichPoemWritingArea({
  title,
  onTitleChange,
  body,
  onBodyChange,
  font,
  theme,
  textColor,
  fontSize,
  onThemeChange,
  onTextColorChange,
  onTitlePaste,
}: RichPoemWritingAreaProps) {
  const editorRef = useRef<Editor | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const themeStyle = themeClasses(theme);
  const defaultFontFamily = poemFontToFamily(font);
  const defaultFontSize = FONT_SIZE_MAP[fontSize];

  return (
    <>
      <RichFormatToolbar editor={editor ?? editorRef.current} />

      <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2 border-b border-border-faint bg-surface/80 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-dim shrink-0">
          Fundo
        </span>
        {THEME_OPTIONS.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.label}
            onClick={() => {
              onThemeChange(t.id);
              onTextColorChange(getThemeDefaultText(t.id));
            }}
            className={cn(
              "h-7 w-7 shrink-0 rounded-lg border-2 transition-transform active:scale-95",
              theme === t.id ? "border-accent scale-110" : "border-stone-300/60"
            )}
            style={{ backgroundColor: t.swatch }}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div
          className={cn(
            "min-h-[calc(100%-1rem)] rounded-2xl border shadow-sm flex flex-col",
            themeStyle.bg,
            themeStyle.border
          )}
        >
          <div className="flex flex-col flex-1 px-5 py-6">
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onPaste={onTitlePaste}
              placeholder="Título (opcional)"
              className="bg-transparent text-xl font-semibold mb-4 outline-none w-full tracking-tight shrink-0 placeholder:opacity-40 font-display"
              style={{ color: textColor }}
            />
            <RichPoemBodyEditor
              content={body}
              onChange={onBodyChange}
              defaultColor={textColor}
              defaultFontFamily={defaultFontFamily}
              defaultFontSize={defaultFontSize}
              editorRef={editorRef}
              onEditorReady={setEditor}
            />
          </div>
        </div>
      </div>
    </>
  );
}
