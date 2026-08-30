/** Full typography catalog for inline rich-text formatting. */
export type PoemFontId =
  | "literata"
  | "playfair"
  | "lora"
  | "merriweather"
  | "libre-baskerville"
  | "eb-garamond"
  | "cormorant"
  | "crimson"
  | "source-serif"
  | "dm-sans"
  | "ibm-mono"
  | "caveat"
  | "dancing-script"
  | "satisfy"
  | "permanent-marker";

export const POEM_FONTS: {
  id: PoemFontId;
  label: string;
  family: string;
  sample: string;
  category: "serif" | "sans" | "mono" | "script" | "display";
}[] = [
  { id: "literata", label: "Literata", family: "var(--font-literata), Georgia, serif", sample: "Aa", category: "serif" },
  { id: "playfair", label: "Playfair", family: "var(--font-playfair), Georgia, serif", sample: "Aa", category: "serif" },
  { id: "lora", label: "Lora", family: "var(--font-lora), Georgia, serif", sample: "Aa", category: "serif" },
  { id: "merriweather", label: "Merriweather", family: "var(--font-merriweather), Georgia, serif", sample: "Aa", category: "serif" },
  { id: "libre-baskerville", label: "Baskerville", family: "var(--font-libre-baskerville), Georgia, serif", sample: "Aa", category: "serif" },
  { id: "eb-garamond", label: "Garamond", family: "var(--font-eb-garamond), Georgia, serif", sample: "Aa", category: "serif" },
  { id: "cormorant", label: "Cormorant", family: "var(--font-cormorant), Georgia, serif", sample: "Aa", category: "serif" },
  { id: "crimson", label: "Crimson", family: "var(--font-crimson), Georgia, serif", sample: "Aa", category: "serif" },
  { id: "source-serif", label: "Source Serif", family: "var(--font-source-serif), Georgia, serif", sample: "Aa", category: "serif" },
  { id: "dm-sans", label: "DM Sans", family: "var(--font-dm-sans), system-ui, sans-serif", sample: "Aa", category: "sans" },
  { id: "ibm-mono", label: "Máquina", family: "var(--font-mono), monospace", sample: "Aa", category: "mono" },
  { id: "caveat", label: "Caveat", family: "var(--font-caveat), cursive", sample: "Aa", category: "script" },
  { id: "dancing-script", label: "Dancing", family: "var(--font-dancing-script), cursive", sample: "Aa", category: "script" },
  { id: "satisfy", label: "Satisfy", family: "var(--font-satisfy), cursive", sample: "Aa", category: "script" },
  { id: "permanent-marker", label: "Marker", family: "var(--font-permanent-marker), cursive", sample: "Aa", category: "display" },
];

export const FONT_SIZE_VALUES = [
  { id: "xs", label: "PP", value: "0.8125rem" },
  { id: "sm", label: "P", value: "0.9375rem" },
  { id: "md", label: "M", value: "1.0625rem" },
  { id: "lg", label: "G", value: "1.25rem" },
  { id: "xl", label: "GG", value: "1.5rem" },
  { id: "2xl", label: "XG", value: "1.875rem" },
] as const;

export const TEXT_COLORS = [
  { id: "ink", label: "Preto", value: "#1c1917" },
  { id: "charcoal", label: "Carvão", value: "#44403c" },
  { id: "wine", label: "Vinho", value: "#881337" },
  { id: "rose", label: "Rosa", value: "#be123c" },
  { id: "navy", label: "Azul", value: "#1e3a5f" },
  { id: "forest", label: "Verde", value: "#14532d" },
  { id: "amber", label: "Âmbar", value: "#92400e" },
  { id: "violet", label: "Violeta", value: "#5b21b6" },
  { id: "cream", label: "Creme", value: "#fef3c7" },
  { id: "white", label: "Branco", value: "#fafaf9" },
  { id: "silver", label: "Prata", value: "#cbd5e1" },
];

export const HIGHLIGHT_COLORS = [
  { id: "yellow", label: "Amarelo", value: "#fef08a" },
  { id: "rose", label: "Rosa", value: "#fecdd3" },
  { id: "mint", label: "Menta", value: "#bbf7d0" },
  { id: "sky", label: "Céu", value: "#bae6fd" },
  { id: "lavender", label: "Lilás", value: "#e9d5ff" },
  { id: "peach", label: "Pêssego", value: "#fed7aa" },
];

export function getFontFamily(id: PoemFontId): string {
  return POEM_FONTS.find((f) => f.id === id)?.family ?? POEM_FONTS[0].family;
}
