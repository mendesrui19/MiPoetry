import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelative(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: pt });
}

export function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\w\u00C0-\u017F]+/g);
  if (!matches) return [];
  return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
}

export function generateId() {
  return crypto.randomUUID();
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export { fontClass, themeStyles, fontSizeClass, themeClasses, getThemeDefaultText, resolvePoemStyle } from "./poem-style";
