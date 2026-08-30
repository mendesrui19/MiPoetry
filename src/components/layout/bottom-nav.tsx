"use client";

import { Bell, BookOpen, Compass, Home, PenLine, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";

const navItems = [
  { href: "/feed", icon: Home, label: "Feed" },
  { href: "/search", icon: Compass, label: "Descobrir" },
  { href: "/write", icon: PenLine, label: "Escrever", accent: true },
  { href: "/notifications", icon: Bell, label: "Alertas" },
  { href: "/profile", icon: User, label: "Perfil" },
];

export function BottomNav() {
  const pathname = usePathname();
  const unread = useStore((s) => s.getUnreadNotificationCount());

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-white/40 bg-surface/75 backdrop-blur-2xl safe-bottom shadow-[0_-4px_24px_rgba(28,25,23,0.06)]">
      <div className="mx-auto flex max-w-lg items-end justify-around px-2 pt-2 pb-1">
        {navItems.map(({ href, icon: Icon, label, accent }) => {
          const active = pathname.startsWith(href);
          if (accent) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center -mt-4"
                aria-label={label}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 active:scale-95 transition-transform ring-4 ring-accent/10">
                  <Icon className="h-5 w-5" strokeWidth={2.25} />
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[56px]",
                active ? "text-accent" : "text-ink-dim hover:text-ink-muted"
              )}
              aria-label={label}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
              {href === "/notifications" && unread > 0 && (
                <span className="absolute top-0 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border-faint bg-surface/90 backdrop-blur-xl px-4 py-3 safe-top min-h-[calc(var(--header-height)+var(--safe-top))]">
      <h1 className="font-display text-[1.125rem] font-semibold tracking-tight text-ink">{title}</h1>
      {action}
    </header>
  );
}

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("page-shell mx-auto max-w-lg bg-paper", className)}>
      {children}
    </div>
  );
}

export function StickyHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex items-center gap-3 border-b border-border-faint bg-surface/90 backdrop-blur-xl px-4 py-3 safe-top min-h-[calc(var(--header-height)+var(--safe-top))]",
        className
      )}
    >
      {children}
    </header>
  );
}

export function EmptyState({
  icon: Icon = BookOpen,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft border border-accent/10">
        <Icon className="h-6 w-6 text-accent" />
      </div>
      <h3 className="font-display text-base font-semibold tracking-tight text-ink mb-1.5">{title}</h3>
      <p className="text-sm text-ink-muted leading-relaxed mb-6 max-w-xs">{description}</p>
      {action}
    </div>
  );
}
