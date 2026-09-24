'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface CountUpProps {
  end: number;
  duration?: number;
  start?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function CountUp({
  end,
  duration = 2000,
  start = 0,
  suffix = '',
  prefix = '',
  className = '',
}: CountUpProps) {
  const [animatedCount, setAnimatedCount] = useState(start);
  const reducedMotion = useReducedMotion();
  const countRef = useRef<HTMLSpanElement>(null);
  const hasAnimatedRef = useRef(false);

  // Reduced motion: show the final value straight away.
  const count = reducedMotion ? end : animatedCount;

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    let timer: ReturnType<typeof setInterval> | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          const increment = (end - start) / (duration / 16);
          let current = start;

          timer = setInterval(() => {
            current += increment;
            if (current >= end) {
              setAnimatedCount(end);
              clearInterval(timer);
              timer = undefined;
            } else {
              setAnimatedCount(Math.floor(current));
            }
          }, 16);
        }
      },
      { threshold: 0.1 },
    );

    const el = countRef.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
      if (timer !== undefined) {
        // Interrupted mid-count: restart on the next run instead of freezing on a partial value.
        clearInterval(timer);
        hasAnimatedRef.current = false;
      }
    };
  }, [end, start, duration, reducedMotion]);

  return (
    <span ref={countRef} className={className}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}
