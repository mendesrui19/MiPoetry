"use client";

import { cn, fontClass, fontSizeClass, themeClasses } from "@/lib/cn";
import type { FontSize, FontStyle, ThemeStyle } from "@/lib/types";

export function PoemPreview({
  title,
  body,
  font,
  theme,
  textColor,
  fontSize,
  authorName,
  className,
}: {
  title: string;
  body: string;
  font: FontStyle;
  theme: ThemeStyle;
  textColor: string;
  fontSize: FontSize;
  authorName?: string;
  className?: string;
}) {
  const t = themeClasses(theme);

  return (
    <div className={cn("rounded-2xl border overflow-hidden shadow-sm", t.bg, t.border, className)}>
      <div className="px-5 py-6" style={{ color: textColor }}>
        {authorName && (
          <p className="text-xs opacity-50 mb-4 font-sans tracking-wide uppercase">
            {authorName}
          </p>
        )}
        {title.trim() && (
          <h2
            className={cn(
              "font-display text-base font-semibold tracking-tight mb-4",
              fontClass(font)
            )}
          >
            {title}
          </h2>
        )}
        <p className={cn("poem-body whitespace-pre-wrap", fontClass(font), fontSizeClass(fontSize))}>
          {body || "O teu poema aparece aqui..."}
        </p>
      </div>
    </div>
  );
}
