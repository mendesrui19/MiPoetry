"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function NavVisibility() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const editingBook = pathname === "/books" && Boolean(searchParams.get("edit"));
  const immersive = pathname.startsWith("/write") || editingBook;

  if (immersive) return null;
  return <BottomNav />;
}

export function NavShell() {
  return (
    <Suspense fallback={null}>
      <NavVisibility />
    </Suspense>
  );
}
