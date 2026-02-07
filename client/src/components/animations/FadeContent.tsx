'use client';

import { useEffect, useRef, useState } from 'react';

interface FadeContentProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function FadeContent({ children, className = '', delay = 0 }: FadeContentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasBeenVisibleRef = useRef(false);

  useEffect(() => {
    if (hasBeenVisibleRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !hasBeenVisibleRef.current) {
          hasBeenVisibleRef.current = true;
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      { threshold: 0.1 },
    );

    const el = ref.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-[transform,opacity] duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}
