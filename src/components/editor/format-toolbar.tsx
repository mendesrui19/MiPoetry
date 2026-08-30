"use client";

import {
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  TEXT_COLORS,
  THEME_OPTIONS,
  getThemeDefaultText,
} from "@/lib/poem-style";
import { cn } from "@/lib/cn";
import type { FontSize, FontStyle, ThemeStyle } from "@/lib/types";
import { Baseline, Palette } from "lucide-react";

interface FormatToolbarProps {
  font: FontStyle;
  theme: ThemeStyle;
  textColor: string;
  fontSize: FontSize;
  onFontChange: (f: FontStyle) => void;
  onThemeChange: (t: ThemeStyle) => void;
  onTextColorChange: (c: string) => void;
  onFontSizeChange: (s: FontSize) => void;
}

export function FormatToolbar({
  font,
  theme,
  textColor,
  fontSize,
  onFontChange,
  onThemeChange,
  onTextColorChange,
  onFontSizeChange,
}: FormatToolbarProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-border-faint bg-surface/95 backdrop-blur-xl px-3 py-2.5 space-y-2.5">
      <div className="flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-dim shrink-0 w-8">
          Fonte
        </span>
        {FONT_OPTIONS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onFontChange(f.id)}
            className={cn(
              "flex items-center gap-1.5 shrink-0 rounded-lg border px-2.5 py-1.5 transition-colors",
              font === f.id
                ? "border-accent bg-accent-soft"
                : "border-border bg-surface hover:bg-surface-up"
            )}
          >
            <span className={cn("text-base leading-none", f.className)}>{f.sample}</span>
            <span className="text-xs font-medium text-ink">{f.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-dim shrink-0 w-8">
          Tam.
        </span>
        {FONT_SIZE_OPTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onFontSizeChange(s.id)}
            className={cn(
              "h-8 w-8 shrink-0 rounded-lg border text-xs font-bold transition-colors",
              fontSize === s.id
                ? "border-accent bg-accent-soft text-accent"
                : "border-border text-ink-muted hover:bg-surface-up"
            )}
          >
            {s.label}
          </button>
        ))}

        <span className="w-px h-6 bg-border shrink-0 mx-0.5" aria-hidden />

        <Baseline className="h-3.5 w-3.5 text-ink-dim shrink-0" aria-hidden />
        {TEXT_COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            title={c.label}
            onClick={() => onTextColorChange(c.value)}
            className={cn(
              "h-7 w-7 shrink-0 rounded-full border-2 transition-transform active:scale-95",
              textColor === c.value ? "border-accent scale-110" : "border-stone-300/60"
            )}
            style={{ backgroundColor: c.value }}
          />
        ))}

        <span className="w-px h-6 bg-border shrink-0 mx-0.5" aria-hidden />

        <Palette className="h-3.5 w-3.5 text-ink-dim shrink-0" aria-hidden />
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
    </div>
  );
}
