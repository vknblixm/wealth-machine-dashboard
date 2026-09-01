'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function FloatingMoney() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([
    ...Array(15).fill(0).map((_, i) => ({ id: i, x: Math.random() * 100, y: Math.random() * 100 })),
  ]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute text-neon-green text-2xl font-bold opacity-40"
          initial={{ x: mousePos.x, y: mousePos.y }}
          animate={{
            x: mousePos.x + (Math.random() - 0.5) * 200,
            y: mousePos.y + (Math.random() - 0.5) * 200,
            opacity: [0.4, 0.1],
            scale: [1, 0.3],
          }}
          transition={{ duration: 3, ease: 'easeOut' }}
        >
          $
        </motion.div>
      ))}
    </div>
  );
}
