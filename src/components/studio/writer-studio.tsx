"use client";

import { useCurrentUser } from "@/lib/store";
import { useMounted } from "@/lib/use-mounted";

export function WriterStudio() {
  const user = useCurrentUser();
  const mounted = useMounted();
  if (!user) return null;

  const hour = mounted ? new Date().getHours() : 12;
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
