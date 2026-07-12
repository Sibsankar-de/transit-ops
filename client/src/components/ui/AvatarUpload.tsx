import React from "react";
import { cn } from "../utils";

export interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs font-semibold",
  md: "w-10 h-10 text-sm font-semibold",
  lg: "w-16 h-16 text-xl font-bold",
  xl: "w-24 h-24 text-3xl font-bold",
};

export function Avatar({ name, size = "md", className }: AvatarProps) {
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-primary/90 to-primary text-primary-foreground select-none shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}

export default Avatar;
