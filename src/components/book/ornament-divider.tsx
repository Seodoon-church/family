"use client";

interface OrnamentDividerProps {
  symbol?: string;
  className?: string;
}

export function OrnamentDivider({ symbol = "◆", className = "" }: OrnamentDividerProps) {
  return (
    <div className={`ornament-divider ${className}`}>
      <span className="text-accent-gold text-sm">{symbol}</span>
    </div>
  );
}
