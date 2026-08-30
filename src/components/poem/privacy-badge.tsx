"use client";

import { cn } from "@/lib/cn";
import { getPrivacyOption, PRIVACY_OPTIONS } from "@/lib/privacy";
import type { Privacy } from "@/lib/types";

export function PrivacyBadge({
  privacy,
  showLabel = false,
  size = "sm",
}: {
  privacy: Privacy;
  showLabel?: boolean;
  size?: "sm" | "md";
}) {
  const option = getPrivacyOption(privacy);

  if (privacy === "public" && !showLabel) return null;

  const Icon = option.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        privacy === "public" && "bg-surface text-ink-muted border border-border-faint",
        privacy === "followers" && "bg-accent/10 text-accent-deep border border-accent/20",
        privacy === "private" && "bg-ink/5 text-ink-muted border border-border-faint"
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {showLabel && option.shortLabel}
    </span>
  );
}

export function PrivacySelector({
  value,
  onChange,
  compact = false,
}: {
  value: Privacy;
  onChange: (p: Privacy) => void;
  compact?: boolean;
}) {
  const selected = getPrivacyOption(value);

  if (compact) {
    return (
      <div className="flex gap-1.5">
        {PRIVACY_OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl border py-2.5 px-1 transition-colors",
                active
                  ? "border-accent bg-accent/10 text-accent-deep"
                  : "border-border-faint text-ink-muted hover:bg-surface"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[10px] font-medium leading-tight">{option.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-ink-muted">Quem pode ver?</p>
      <div className="space-y-1.5">
        {PRIVACY_OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                active
                  ? "border-accent bg-accent/10"
                  : "border-border-faint hover:bg-surface"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  active ? "text-accent-deep" : "text-ink-dim"
                )}
              />
              <div className="min-w-0">
                <p className={cn("text-sm font-medium", active ? "text-accent-deep" : "text-ink")}>
                  {option.label}
                </p>
                <p className="text-xs text-ink-dim">{option.description}</p>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-ink-dim pt-1">
        {selected.description}. Podes alterar isto a qualquer momento.
      </p>
    </div>
  );
}
