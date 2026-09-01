'use client';

import { motion } from 'framer-motion';
import { pulseVariants } from '@/lib/animations';

interface PulseGlowProps {
  className?: string;
  color?: 'green' | 'red' | 'blue' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}

const colorMap = {
  green: 'rgba(0, 255, 65, 0.4)',
  red: 'rgba(255, 0, 110, 0.4)',
  blue: 'rgba(0, 217, 255, 0.4)',
  purple: 'rgba(157, 78, 221, 0.4)',
};

const sizeMap = {
  sm: '40px',
  md: '60px',
  lg: '80px',
};

export function PulseGlow({
  className = '',
  color = 'green',
  size = 'md',
}: PulseGlowProps) {
  return (
    <motion.div
      variants={pulseVariants}
      animate="animate"
      className={`rounded-full ${className}`}
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        boxShadow: `0 0 0 0 ${colorMap[color]}`,
      }}
    />
  );
}
