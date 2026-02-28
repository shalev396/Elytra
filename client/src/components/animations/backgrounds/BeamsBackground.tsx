'use client';

import { useEffect, useRef } from 'react';

interface BeamsBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export function BeamsBackground({ className = '', children }: BeamsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const beams: {
      x: number;
      y: number;
      height: number;
      speed: number;
      opacity: number;
    }[] = [];
    const numBeams = 8;

    for (let i = 0; i < numBeams; i++) {
      beams.push({
        x: (canvas.offsetWidth / numBeams) * i + Math.random() * 50,
        y: -100,
        height: Math.random() * 200 + 100,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    const primaryRgb =
      getComputedStyle(document.documentElement).getPropertyValue('--primary-rgb').trim() ||
      '139, 92, 246';

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      beams.forEach((beam) => {
        const gradient = ctx.createLinearGradient(beam.x, beam.y, beam.x, beam.y + beam.height);
        gradient.addColorStop(0, `rgba(${primaryRgb}, 0)`);
        gradient.addColorStop(0.5, `rgba(${primaryRgb}, ${beam.opacity})`);
        gradient.addColorStop(1, `rgba(${primaryRgb}, 0)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(beam.x, beam.y, 2, beam.height);

        beam.y += beam.speed;
        if (beam.y > canvas.offsetHeight) {
          beam.y = -beam.height;
          beam.x = (canvas.offsetWidth / numBeams) * Math.floor(Math.random() * numBeams);
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      {children}
    </div>
  );
}
