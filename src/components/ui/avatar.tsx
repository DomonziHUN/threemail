import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  fallback: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({ fallback, className, size = "md", ...props }: AvatarProps) {
  const initials = fallback ? fallback.slice(0, 2).toUpperCase() : "?";
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary/90 font-semibold text-white",
        sizeMap[size],
        className
      )}
      {...props}
    >
      {initials}
    </div>
  );
}
