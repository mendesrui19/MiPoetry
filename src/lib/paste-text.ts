/**
 * Normaliza texto colado de Notas (iOS), Google Keep, Word, etc.
 * Preserva quebras de linha e estrofes; limpa caracteres invisíveis.
 */
export function normalizePoemText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u2028/g, "\n")
    .replace(/\u2029/g, "\n\n")
    .replace(/\u00A0/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\t/g, "  ")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

/** Uma linha para título — remove quebras e espaços extra. */
export function normalizePoemTitle(text: string): string {
  return normalizePoemText(text).replace(/\s*\n+\s*/g, " ").trim();
}

/**
 * Se colares um bloco inteiro num corpo vazio, separa título (1.ª linha curta)
 * do resto quando parece haver um poema por baixo.
 */
export function splitPastedPoem(text: string): { title: string; body: string } | null {
  const normalized = normalizePoemText(text);
  const lines = normalized.split("\n");
  if (lines.length < 2) return null;

  const first = lines[0].trim();
  const rest = lines.slice(1).join("\n").trim();
  if (!first || !rest) return null;
  if (first.length > 80) return null;
  if (rest.split("\n").filter(Boolean).length < 2) return null;

  return { title: first, body: rest };
}

export function insertTextAtSelection(
  element: HTMLTextAreaElement | HTMLInputElement,
  current: string,
  insert: string
): { value: string; cursor: number } {
  const start = element.selectionStart ?? current.length;
  const end = element.selectionEnd ?? current.length;
  const value = current.slice(0, start) + insert + current.slice(end);
  return { value, cursor: start + insert.length };
}
