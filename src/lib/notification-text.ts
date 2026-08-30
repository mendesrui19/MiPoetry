import type { NotificationType } from "@/lib/types";

export function notificationMessage(
  type: NotificationType,
  actorName: string,
  poemTitle?: string
): string {
  switch (type) {
    case "poem_published":
      return `${actorName} publicou "${poemTitle ?? "um poema"}"`;
    case "comment":
      return `${actorName} comentou em "${poemTitle ?? "o teu poema"}"`;
    case "reaction":
      return `${actorName} reagiu a "${poemTitle ?? "o teu poema"}"`;
    case "follow":
      return `${actorName} começou a seguir-te`;
    default:
      return `${actorName} interagiu contigo`;
  }
}

export function notificationLink(
  type: NotificationType,
  poemId?: string,
  actorUsername?: string
): string {
  if (type === "follow" && actorUsername) return `/profile/${actorUsername}`;
  if (poemId) return `/poem/${poemId}`;
  return "/notifications";
}
