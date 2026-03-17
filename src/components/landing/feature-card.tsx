import { type ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  description: string;
}

export function FeatureCard({ icon, title, subtitle, description }: FeatureCardProps) {
  return (
    <div className="landing-feature-card bg-card rounded-xl border border-border warm-shadow p-6">
      <div className="w-14 h-14 text-primary mb-4">{icon}</div>
      <h3
        className="text-lg font-semibold text-foreground mb-1"
        style={{ fontFamily: "var(--font-story)" }}
      >
        {title}
      </h3>
      <p className="text-sm text-accent-gold font-medium mb-2">{subtitle}</p>
      <p className="text-sm text-foreground/60 leading-relaxed">{description}</p>
    </div>
  );
}
