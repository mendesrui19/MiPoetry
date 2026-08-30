import type { FontSize, FontStyle, ThemeStyle } from "@/lib/types";

export type PoemStyleState = {
  font: FontStyle;
  theme: ThemeStyle;
  textColor: string;
  fontSize: FontSize;
};

export const FONT_OPTIONS: {
  id: FontStyle;
  label: string;
  sample: string;
  className: string;
}[] = [
  { id: "classic", label: "Clássica", sample: "Aa", className: "font-classic" },
  { id: "elegant", label: "Elegante", sample: "Aa", className: "font-classic italic" },
  { id: "sans", label: "Moderna", sample: "Aa", className: "font-sans" },
  { id: "typewriter", label: "Máquina", sample: "Aa", className: "font-typewriter" },
];

export const FONT_SIZE_OPTIONS: { id: FontSize; label: string; className: string }[] = [
  { id: "sm", label: "P", className: "text-[0.9375rem] leading-[1.75]" },
  { id: "md", label: "M", className: "text-[1.0625rem] leading-[1.85]" },
  { id: "lg", label: "G", className: "text-[1.25rem] leading-[1.9]" },
  { id: "xl", label: "GG", className: "text-[1.5rem] leading-[2]" },
];

export const TEXT_COLORS: { id: string; label: string; value: string }[] = [
  { id: "ink", label: "Preto", value: "#1c1917" },
  { id: "charcoal", label: "Carvão", value: "#44403c" },
  { id: "wine", label: "Vinho", value: "#881337" },
  { id: "rose", label: "Rosa", value: "#be123c" },
  { id: "navy", label: "Azul", value: "#1e3a5f" },
  { id: "forest", label: "Verde", value: "#14532d" },
  { id: "amber", label: "Âmbar", value: "#92400e" },
  { id: "cream", label: "Creme", value: "#fef3c7" },
  { id: "white", label: "Branco", value: "#fafaf9" },
  { id: "silver", label: "Prata", value: "#cbd5e1" },
];

export const THEME_OPTIONS: {
  id: ThemeStyle;
  label: string;
  bg: string;
  border: string;
  defaultText: string;
  swatch: string;
}[] = [
  { id: "light", label: "Branco", bg: "bg-white", border: "border-stone-200", defaultText: "#1c1917", swatch: "#ffffff" },
  { id: "parchment", label: "Papel", bg: "bg-stone-50", border: "border-stone-200", defaultText: "#1c1917", swatch: "#fafaf9" },
  { id: "cream", label: "Creme", bg: "bg-amber-50", border: "border-amber-100", defaultText: "#422006", swatch: "#fffbeb" },
  { id: "rose", label: "Rosa", bg: "bg-rose-50", border: "border-rose-100", defaultText: "#881337", swatch: "#fff1f2" },
  { id: "forest", label: "Verde", bg: "bg-emerald-50", border: "border-emerald-100", defaultText: "#14532d", swatch: "#ecfdf5" },
  { id: "ocean", label: "Oceano", bg: "bg-sky-50", border: "border-sky-100", defaultText: "#0c4a6e", swatch: "#f0f9ff" },
  { id: "slate", label: "Cinza", bg: "bg-slate-100", border: "border-slate-200", defaultText: "#334155", swatch: "#f1f5f9" },
  { id: "dark", label: "Escuro", bg: "bg-stone-900", border: "border-stone-700", defaultText: "#fafaf9", swatch: "#1c1917" },
  { id: "midnight", label: "Meia-noite", bg: "bg-slate-950", border: "border-slate-800", defaultText: "#e2e8f0", swatch: "#0f172a" },
  { id: "wine", label: "Vinho", bg: "bg-[#1a0a10]", border: "border-rose-950", defaultText: "#fecdd3", swatch: "#1a0a10" },
];

export const DEFAULT_POEM_STYLE: PoemStyleState = {
  font: "classic",
  theme: "parchment",
  textColor: "#1c1917",
  fontSize: "md",
};

export function fontClass(font: FontStyle) {
  return FONT_OPTIONS.find((f) => f.id === font)?.className ?? "font-classic";
}

export function fontSizeClass(size: FontSize) {
  return FONT_SIZE_OPTIONS.find((s) => s.id === size)?.className ?? FONT_SIZE_OPTIONS[1].className;
}

export function themeClasses(theme: ThemeStyle) {
  const t = THEME_OPTIONS.find((o) => o.id === theme) ?? THEME_OPTIONS[1];
  return { bg: t.bg, border: t.border, defaultText: t.defaultText };
}

/** @deprecated use themeClasses + inline textColor */
export function themeStyles(theme: ThemeStyle) {
  const t = themeClasses(theme);
  return { bg: t.bg, text: "", border: t.border };
}

export function getThemeDefaultText(theme: ThemeStyle) {
  return themeClasses(theme).defaultText;
}

export function resolvePoemStyle(poem: {
  theme: ThemeStyle;
  textColor?: string;
  font: FontStyle;
  fontSize?: FontSize;
}) {
  const theme = themeClasses(poem.theme);
  return {
    bg: theme.bg,
    border: theme.border,
    textColor: poem.textColor ?? theme.defaultText,
    fontClassName: fontClass(poem.font),
    fontSizeClassName: fontSizeClass(poem.fontSize ?? "md"),
  };
}
