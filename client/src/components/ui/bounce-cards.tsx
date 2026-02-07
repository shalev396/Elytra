import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface BounceCardProps {
  children: React.ReactNode;
  className?: string;
}

export function BounceCard({ children, className }: BounceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) {
      return;
    }
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-card transition-all duration-300',
        isHovered && 'scale-105 shadow-lg',
        className,
      )}
    >
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(var(--primary-rgb), 0.15), transparent 40%)`,
          }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

interface BounceCardsProps {
  children: React.ReactNode;
  className?: string;
}

export function BounceCards({ children, className }: BounceCardsProps) {
  return (
    <div className={cn('grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3', className)}>
      {children}
    </div>
  );
}
