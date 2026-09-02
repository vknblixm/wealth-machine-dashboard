'use client';

import { motion } from 'framer-motion';

interface PulseGlowProps {
  className?: string;
  color?: 'green' | 'red' | 'blue' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}

const colorMap = {
  green: 'rgba(0, 255, 65, 0.6)',
  red: 'rgba(255, 0, 110, 0.6)',
  blue: 'rgba(0, 217, 255, 0.6)',
  purple: 'rgba(157, 78, 221, 0.6)',
};

const sizeMap = {
  sm: 8,
  md: 12,
  lg: 16,
};

export function PulseGlow({ className = '', color = 'green', size = 'md' }: PulseGlowProps) {
  const s = sizeMap[size];
  return (
    <div className={`relative ${className}`} style={{ width: s, height: s }}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: colorMap[color] }}
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.8, 0, 0.8],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: colorMap[color] }}
      />
    </div>
  );
}
