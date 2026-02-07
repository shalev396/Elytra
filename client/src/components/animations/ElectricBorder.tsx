"use client";

interface ElectricBorderProps {
  children: React.ReactNode;
  className?: string;
}

export function ElectricBorder({
  children,
  className = "",
}: ElectricBorderProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-lg border bg-card ${className}`}
    >
      <div className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
