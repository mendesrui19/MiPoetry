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

interface StylePanelProps {
  font: FontStyle;
  theme: ThemeStyle;
  textColor: string;
  fontSize: FontSize;
  onFontChange: (f: FontStyle) => void;
  onThemeChange: (t: ThemeStyle) => void;
  onTextColorChange: (c: string) => void;
  onFontSizeChange: (s: FontSize) => void;
}

export function StylePanel({
  font,
  theme,
  textColor,
  fontSize,
  onFontChange,
  onThemeChange,
  onTextColorChange,
  onFontSizeChange,
}: StylePanelProps) {
  return (
    <div className="space-y-5">
      <section>
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2.5">
          Tipografia
        </p>
        <div className="grid grid-cols-2 gap-2">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFontChange(f.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                font === f.id
                  ? "border-accent bg-accent-soft"
                  : "border-border bg-surface hover:bg-surface-up"
              )}
            >
              <span className={cn("text-2xl", f.className)}>{f.sample}</span>
              <span className="text-sm font-medium text-ink">{f.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2.5">
          Tamanho
        </p>
        <div className="flex gap-2">
          {FONT_SIZE_OPTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onFontSizeChange(s.id)}
              className={cn(
                "flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors",
                fontSize === s.id
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border text-ink-muted hover:bg-surface-up"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2.5">
          Cor do texto
        </p>
        <div className="flex flex-wrap gap-2">
          {TEXT_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              title={c.label}
              onClick={() => onTextColorChange(c.value)}
              className={cn(
                "h-9 w-9 rounded-full border-2 transition-transform active:scale-95",
                textColor === c.value ? "border-accent scale-110" : "border-transparent"
              )}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2.5">
          Fundo
        </p>
        <div className="grid grid-cols-5 gap-2">
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
                "aspect-square rounded-xl border-2 transition-transform active:scale-95",
                theme === t.id ? "border-accent scale-105" : "border-stone-200"
              )}
              style={{ backgroundColor: t.swatch }}
            />
          ))}
        </div>
        <p className="text-xs text-ink-dim mt-2">
          {THEME_OPTIONS.find((t) => t.id === theme)?.label}
        </p>
      </section>
    </div>
  );
}
