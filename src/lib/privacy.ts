import type { Privacy } from "./types";
import { Globe, Lock, Users } from "lucide-react";

export const PRIVACY_OPTIONS: {
  id: Privacy;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof Globe;
}[] = [
  {
    id: "public",
    label: "Público",
    shortLabel: "Público",
    description: "Todos podem ver",
    icon: Globe,
  },
  {
    id: "followers",
    label: "Amigos",
    shortLabel: "Amigos",
    description: "Só quem te segue",
    icon: Users,
  },
  {
    id: "private",
    label: "Privado",
    shortLabel: "Privado",
    description: "Só tu vês",
    icon: Lock,
  },
];

export function getPrivacyOption(id: Privacy) {
  return PRIVACY_OPTIONS.find((o) => o.id === id) ?? PRIVACY_OPTIONS[0];
}

export function canSharePoem(privacy: Privacy) {
  return privacy === "public";
}
