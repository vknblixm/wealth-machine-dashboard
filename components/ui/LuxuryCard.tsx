'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface LuxuryCardProps {
  children: ReactNode;
  className?: string;
  glow?: 'gold' | 'violet' | 'teal' | 'none';
  delay?: number;
}

export function LuxuryCard({ children, className = '', glow = 'none', delay = 0 }: LuxuryCardProps) {
  const glowMap = {
    gold: 'glow-gold',
    violet: 'glow-violet',
    teal: 'glow-teal',
    none: '',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.23, 1, 0.32, 1],
      }}
      className={`luxury-glass p-6 ${glowMap[glow]} ${className}`}
    >
      {children}
    </motion.div>
  );
}
