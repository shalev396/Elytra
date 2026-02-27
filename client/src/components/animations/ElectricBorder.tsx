'use client';

interface ElectricBorderProps {
  children: React.ReactNode;
  className?: string;
}

export function ElectricBorder({ children, className = '' }: ElectricBorderProps) {
  return (
    <div className={`group relative rounded-lg ${className}`}>
      <div className="absolute -inset-px overflow-hidden rounded-lg">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute inset-0 bg-linear-to-r from-primary via-accent to-primary bg-size-[200%_100%] animate-[shimmer_2s_linear_infinite]" />
        </div>
        <div className="absolute inset-0 border rounded-lg border-border" />
      </div>
      <div className="relative bg-card rounded-lg">{children}</div>
    </div>
  );
}
