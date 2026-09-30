import type { Challenge } from "./types";

const now = Date.now();
const day = 86400000;

/** Desafio activo por defeito quando a cloud não envia desafios. */
export function getDefaultActiveChallenge(): Challenge {
  return {
    id: "challenge-weekly-default",
    title: "Desafio da semana",
    prompt: "Escreve um poema sobre a chuva — livre ou em 4 versos.",
    hashtag: "desafiochuva",
    startsAt: new Date(now - 2 * day).toISOString(),
    endsAt: new Date(now + 5 * day).toISOString(),
  };
}

export function pickActiveChallenge(challenges: Challenge[]): Challenge | null {
  const t = Date.now();
  const active = challenges.find(
    (c) => new Date(c.startsAt).getTime() <= t && new Date(c.endsAt).getTime() >= t
  );
  if (active) return active;
  if (challenges.length > 0) return challenges[0];
  return getDefaultActiveChallenge();
}

export function poemsForChallenge(
  poems: { hashtags: string[]; privacy: string; authorId: string }[],
  hashtag: string,
  viewerId: string | null
) {
  const tag = hashtag.toLowerCase().replace(/^#/, "");
  return poems.filter((p) => {
    if (p.privacy === "private" && p.authorId !== viewerId) return false;
    if (p.privacy === "followers" && p.authorId !== viewerId) {
      /* visibilidade já filtrada pelo caller idealmente */
    }
    return p.hashtags.some((h) => h.toLowerCase() === tag);
  });
}
