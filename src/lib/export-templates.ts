import type { FontSize, FontStyle, ThemeStyle } from "@/lib/types";

export type ExportTemplateId = "classic" | "minimal" | "story" | "dark";

export const EXPORT_TEMPLATES: {
  id: ExportTemplateId;
  label: string;
  description: string;
  width: number;
  height: number;
  className: string;
  titleClass: string;
  bodyClass: string;
}[] = [
  {
    id: "classic",
    label: "Clássico",
    description: "Papel creme, elegante",
    width: 400,
    height: 560,
    className: "bg-stone-50 border-stone-200",
    titleClass: "font-classic text-2xl",
    bodyClass: "font-classic text-base",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Branco limpo",
    width: 400,
    height: 560,
    className: "bg-white border-stone-200",
    titleClass: "font-sans text-xl font-semibold",
    bodyClass: "font-sans text-sm",
  },
  {
    id: "story",
    label: "Story",
    description: "Formato 9:16 para redes",
    width: 360,
    height: 640,
    className: "bg-stone-900 border-stone-700",
    titleClass: "font-display text-xl text-stone-50",
    bodyClass: "font-classic text-base text-stone-100",
  },
  {
    id: "dark",
    label: "Noite",
    description: "Fundo escuro dramático",
    width: 400,
    height: 560,
    className: "bg-slate-950 border-slate-800",
    titleClass: "font-classic text-2xl text-slate-100",
    bodyClass: "font-classic text-base text-slate-200",
  },
];

export function getExportTemplate(id: ExportTemplateId) {
  return EXPORT_TEMPLATES.find((t) => t.id === id) ?? EXPORT_TEMPLATES[0];
}

export type PoemStyleSnapshot = {
  font: FontStyle;
  theme: ThemeStyle;
  textColor: string;
  fontSize: FontSize;
};
