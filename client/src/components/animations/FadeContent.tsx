'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface FadeContentProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function FadeContent({ children, className = '', delay = 0 }: FadeContentProps) {
  const [hasFadedIn, setHasFadedIn] = useState(false);
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const hasBeenVisibleRef = useRef(false);

  // Reduced motion: content is shown immediately, with no transition.
  const isVisible = reducedMotion || hasFadedIn;

  useEffect(() => {
    if (reducedMotion || hasBeenVisibleRef.current) {
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !hasBeenVisibleRef.current) {
          hasBeenVisibleRef.current = true;
          timer = setTimeout(() => {
            timer = undefined;
            setHasFadedIn(true);
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
      if (timer !== undefined) {
        // The fade was scheduled but not shown yet: observe again on the next run.
        clearTimeout(timer);
        hasBeenVisibleRef.current = false;
      }
    };
  }, [delay, reducedMotion]);

  return (
    <div
      ref={ref}
      className={`${reducedMotion ? '' : 'transition-[transform,opacity] duration-1000'} ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}
