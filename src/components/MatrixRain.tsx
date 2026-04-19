'use client';

import { useEffect, useRef } from 'react';

/**
 * Fondo animado tipo "Matrix" — caracteres cayendo en columnas.
 * Canvas puro, sin emojis. Se autoajusta al tamaño del contenedor (position: fixed).
 */
export default function MatrixRain({ opacity = 0.18 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const fontSize = 16;
    const columns = Math.floor(w / fontSize);
    const drops: number[] = new Array(columns).fill(1).map(() => Math.random() * -50);

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン<>{}[]()/*-+=|&^%$#@!?;:,.';

    let frameId = 0;

    const draw = () => {
      // Fondo con alpha para efecto de estela
      ctx.fillStyle = 'rgba(0, 10, 2, 0.08)';
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${fontSize}px "JetBrains Mono", Menlo, monospace`;

      for (let i = 0; i < drops.length; i++) {
        const txt = chars.charAt(Math.floor(Math.random() * chars.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Cabeza más brillante
        const isHead = Math.random() < 0.05;
        ctx.fillStyle = isHead ? 'rgba(200,255,200,0.95)' : 'rgba(0,255,70,0.85)';
        ctx.fillText(txt, x, y);

        if (y > h && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 1;
      }

      frameId = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity }}
    />
  );
}
