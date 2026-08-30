"use client";

import { formatRelative } from "@/lib/utils";
import { useEffect, useState } from "react";

export function RelativeTime({ date, className }: { date: string; className?: string }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    setText(formatRelative(date));
  }, [date]);

  if (text === null) {
    return <span className={className} aria-hidden="true">&nbsp;</span>;
  }

  return <span className={className}>{text}</span>;
}
