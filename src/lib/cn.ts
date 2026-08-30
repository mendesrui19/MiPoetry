import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export { cn, formatRelative, extractHashtags, generateId, getInitials, fontClass, themeStyles, fontSizeClass, themeClasses, resolvePoemStyle } from "./utils";

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: ClassValue;
} = {}) {
  return twMerge(
    clsx(
      "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
      {
        "bg-accent text-white hover:bg-accent-deep shadow-sm shadow-accent/20": variant === "default",
        "bg-surface text-ink hover:bg-surface-up border border-border": variant === "secondary",
        "hover:bg-surface-up text-ink-muted": variant === "ghost",
        "border border-border bg-transparent hover:bg-surface text-ink": variant === "outline",
        "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
        "h-11 px-5 text-sm": size === "default",
        "h-9 px-3 text-xs": size === "sm",
        "h-12 px-6 text-base": size === "lg",
        "h-11 w-11": size === "icon",
      },
      className
    )
  );
}
