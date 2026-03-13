"use client";

import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  gender?: "MALE" | "FEMALE";
  className?: string;
}

export function Avatar({ src, name, size = "md", gender, className }: AvatarProps) {
  const initial = name.charAt(0);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
  };

  const bgColor = gender === "MALE" ? "bg-accent-blue/15 text-accent-blue" : gender === "FEMALE" ? "bg-accent-red/15 text-accent-red" : "bg-primary-light text-primary";

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover ring-2 ring-accent-cream shadow-sm",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold ring-2 ring-accent-cream shadow-sm",
        sizeClasses[size],
        bgColor,
        className
      )}
    >
      {initial}
    </div>
  );
}
