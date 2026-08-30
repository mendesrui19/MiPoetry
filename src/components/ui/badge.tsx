import { cn } from "@/lib/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "muted";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-surface-up text-ink-muted": variant === "default",
          "bg-accent-soft text-accent": variant === "accent",
          "bg-surface-up text-ink-dim": variant === "muted",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
