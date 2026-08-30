"use client";

import { cn, getInitials } from "@/lib/cn";

interface AvatarProps {
  name: string;
  color?: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

export function Avatar({ name, color = "#C4956A", imageUrl, size = "md", className }: AvatarProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn("rounded-full object-cover shrink-0", sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white shrink-0",
        sizes[size],
        className
      )}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}
