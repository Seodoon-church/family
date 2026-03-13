"use client";

interface GoldCornersProps {
  size?: number;
  className?: string;
}

export function GoldCorners({ size = 24, className = "" }: GoldCornersProps) {
  const style = { width: size, height: size };
  return (
    <div className={className} aria-hidden="true">
      <div className="absolute top-3 left-3 border-t-2 border-l-2 border-accent-gold/30 rounded-tl-sm" style={style} />
      <div className="absolute top-3 right-3 border-t-2 border-r-2 border-accent-gold/30 rounded-tr-sm" style={style} />
      <div className="absolute bottom-3 left-3 border-b-2 border-l-2 border-accent-gold/30 rounded-bl-sm" style={style} />
      <div className="absolute bottom-3 right-3 border-b-2 border-r-2 border-accent-gold/30 rounded-br-sm" style={style} />
    </div>
  );
}
