"use client";

import { useCurrentUser } from "@/lib/store";

export function WriterStudio() {
  const user = useCurrentUser();
  if (!user) return null;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 19 ? "Boa tarde" : "Boa noite";

  return (
    <div className="px-4 pb-3">
      <p className="font-display text-lg font-semibold tracking-tight text-ink">
        {greeting}, {user.displayName.split(" ")[0]}
      </p>
    </div>
  );
}
