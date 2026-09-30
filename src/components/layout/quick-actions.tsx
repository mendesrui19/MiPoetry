"use client";

import { cn } from "@/lib/cn";
import { BookOpen, Bookmark, FileText, MessageSquare, PenLine } from "lucide-react";
import Link from "next/link";

const actions = [
  { href: "/write", icon: PenLine, label: "Escrever", accent: true },
  { href: "/books", icon: BookOpen, label: "Livros" },
  { href: "/messages", icon: MessageSquare, label: "Mensagens" },
  { href: "/profile?tab=drafts", icon: FileText, label: "Rascunhos" },
  { href: "/saved", icon: Bookmark, label: "Guardados" },
];

export function QuickActions({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {actions.map(({ href, icon: Icon, label, accent }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors active:scale-[0.98]",
            accent
              ? "border-accent/30 bg-accent text-white shadow-md shadow-accent/25"
              : "glass-panel border-transparent text-ink-muted hover:text-ink"
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </div>
  );
}
