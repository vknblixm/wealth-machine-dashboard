'use client';

import { useEffect, useRef } from 'react';

export function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let running = true;

    const onMouse = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };
    window.addEventListener('mousemove', onMouse);

    const animate = () => {
      if (!running) return;
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      el.style.transform = `translate(${currentX - 200}px, ${currentY - 200}px)`;
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      running = false;
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="fixed pointer-events-none"
      style={{
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, rgba(201,168,76,0.02) 40%, transparent 70%)',
        filter: 'blur(20px)',
        zIndex: 1,
        willChange: 'transform',
      }}
    />
  );
}
