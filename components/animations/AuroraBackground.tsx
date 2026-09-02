'use client';

import { useEffect, useRef } from 'react';

export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', onMouse);

    let running = true;
    const draw = () => {
      if (!running) return;
      frameRef.current++;
      const t = frameRef.current * 0.005;
      const { x: mx, y: my } = mouseRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Aurora beams that follow mouse
      const beams = [
        { color: 'rgba(201,168,76,0.04)', offsetX: 0.3, offsetY: 0.2, size: 0.5, speed: 0.3 },
        { color: 'rgba(124,58,237,0.035)', offsetX: 0.7, offsetY: 0.6, size: 0.4, speed: 0.5 },
        { color: 'rgba(45,212,191,0.03)', offsetX: 0.5, offsetY: 0.8, size: 0.35, speed: 0.4 },
        { color: 'rgba(201,168,76,0.025)', offsetX: 0.2, offsetY: 0.5, size: 0.6, speed: 0.2 },
      ];

      for (const beam of beams) {
        const bx = (beam.offsetX + mx * 0.15 + Math.sin(t * beam.speed) * 0.05) * canvas.width;
        const by = (beam.offsetY + my * 0.15 + Math.cos(t * beam.speed * 0.7) * 0.05) * canvas.height;
        const radius = beam.size * Math.min(canvas.width, canvas.height);

        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
        grad.addColorStop(0, beam.color);
        grad.addColorStop(0.5, beam.color.replace(/[\d.]+\)$/, '0.01)'));
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Subtle grid lines
      ctx.strokeStyle = 'rgba(201,168,76,0.015)';
      ctx.lineWidth = 0.5;
      const gridSize = 80;
      const offsetX = (mx - 0.5) * 10;
      const offsetY = (my - 0.5) * 10;

      for (let x = -gridSize; x < canvas.width + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x + offsetX, 0);
        ctx.lineTo(x + offsetX, canvas.height);
        ctx.stroke();
      }
      for (let y = -gridSize; y < canvas.height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + offsetY);
        ctx.lineTo(canvas.width, y + offsetY);
        ctx.stroke();
      }

      requestAnimationFrame(draw);
    };
    draw();

    return () => {
      running = false;
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
