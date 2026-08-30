import { bodyToPlainText } from "@/lib/rich-text";
import type { Draft, Poem } from "@/lib/types";

function countWords(text: string) {
  const plain = bodyToPlainText(text).trim();
  if (!plain) return 0;
  return plain.split(/\s+/).length;
}

export interface WriterStats {
  poemCount: number;
  draftCount: number;
  totalWords: number;
  totalReads: number;
  booksCount: number;
  writingDays: number;
}

export function getWriterStats(
  userId: string,
  poems: Poem[],
  drafts: Draft[],
  booksCount: number
): WriterStats {
  const myPoems = poems.filter((p) => p.authorId === userId);
  const myDrafts = drafts.filter((d) => d.authorId === userId);

  const activeDays = new Set<string>();
  for (const p of myPoems) {
    activeDays.add(p.createdAt.slice(0, 10));
    activeDays.add(p.updatedAt.slice(0, 10));
  }
  for (const d of myDrafts) {
    activeDays.add(d.updatedAt.slice(0, 10));
  }

  return {
    poemCount: myPoems.length,
    draftCount: myDrafts.length,
    totalWords:
      myPoems.reduce((n, p) => n + countWords(p.body), 0) +
      myDrafts.reduce((n, d) => n + countWords(d.body), 0),
    totalReads: myPoems.reduce((n, p) => n + p.viewCount, 0),
    booksCount,
    writingDays: activeDays.size,
  };
}

export function getLatestDraft(userId: string, drafts: Draft[]) {
  return drafts
    .filter((d) => d.authorId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}
