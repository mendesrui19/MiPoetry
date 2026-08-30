import type { BookSectionType } from "@/lib/types";

export const BOOK_SECTION_LABELS: Record<BookSectionType, string> = {
  dedication: "Dedicação",
  epigraph: "Epígrafe",
  preface: "Prefácio",
  prologue: "Prólogo",
  introduction: "Introdução",
  acknowledgments: "Agradecimentos",
  afterword: "Posfácio",
  appendix: "Apêndice",
  note: "Nota do autor",
  custom: "Outro",
};

export const FRONT_SECTION_TYPES: BookSectionType[] = [
  "dedication",
  "epigraph",
  "preface",
  "prologue",
  "introduction",
  "note",
  "custom",
];

export const BACK_SECTION_TYPES: BookSectionType[] = [
  "appendix",
  "acknowledgments",
  "afterword",
  "note",
  "custom",
];

export function bookSectionTitle(
  type: BookSectionType,
  customTitle?: string
): string {
  if (type === "custom" && customTitle?.trim()) return customTitle.trim();
  return BOOK_SECTION_LABELS[type];
}

export function sortBookSections<T extends { placement: string; position: number }>(
  sections: T[],
  placement: "front" | "back"
) {
  return sections
    .filter((s) => s.placement === placement)
    .sort((a, b) => a.position - b.position);
}
