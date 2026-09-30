export type PoemTemplateId = "free" | "haiku" | "sonnet";

export type PoemTemplate = {
  id: PoemTemplateId;
  label: string;
  description: string;
  targetLines?: number;
  linePattern?: number[];
  placeholder: string;
};

export const POEM_TEMPLATES: PoemTemplate[] = [
  {
    id: "free",
    label: "Verso livre",
    description: "Sem regras — só o teu ritmo.",
    placeholder: "Deixa o verso respirar…",
  },
  {
    id: "haiku",
    label: "Haiku",
    description: "3 linhas · inspiração 5-7-5 sílabas",
    targetLines: 3,
    linePattern: [5, 7, 5],
    placeholder: "Primeira imagem\nO momento no centro\nEco final",
  },
  {
    id: "sonnet",
    label: "Soneto",
    description: "14 versos · estrutura clássica",
    targetLines: 14,
    placeholder: "Quando eu considerar o eterno verso\n…",
  },
];

/** Contagem aproximada de sílabas (PT) para orientação, não métrica rigorosa. */
export function countSyllablesPt(line: string): number {
  const word = line
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zà-ú\s']/gi, " ")
    .trim();
  if (!word) return 0;

  const vowels = /[aeiouàáâãéêíóôõú]+/gi;
  let total = 0;
  for (const part of word.split(/\s+/)) {
    if (!part) continue;
    const matches = part.match(vowels);
    total += matches ? matches.length : 1;
  }
  return total;
}

export function templateGuide(
  templateId: PoemTemplateId,
  plainBody: string
): { lines: number; detail?: string } {
  const template = POEM_TEMPLATES.find((t) => t.id === templateId) ?? POEM_TEMPLATES[0];
  const lines = plainBody.trim() ? plainBody.split("\n") : [""];
  const nonEmpty = lines.filter((l) => l.trim());

  if (template.id === "haiku" && template.linePattern) {
    const counts = lines.slice(0, 3).map((l) => countSyllablesPt(l));
    const pattern = template.linePattern;
    const parts = counts.map((c, i) => `${c}/${pattern[i] ?? "?"}`);
    return {
      lines: nonEmpty.length,
      detail: `Linhas ${nonEmpty.length}/3 · sílabas ${parts.join(" · ")}`,
    };
  }

  if (template.targetLines) {
    return {
      lines: nonEmpty.length,
      detail: `Versos ${nonEmpty.length}/${template.targetLines}`,
    };
  }

  return { lines: nonEmpty.length };
}
