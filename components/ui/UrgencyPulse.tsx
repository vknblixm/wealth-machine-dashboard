'use client';

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface UrgencyPulseProps {
  message: string;
  severity?: 'high' | 'medium' | 'low';
  className?: string;
}

const severityStyles = {
  high: {
    border: 'border-neon-red/40',
    bg: 'bg-neon-red/5',
    text: 'text-neon-red',
    glow: '0 0 20px rgba(255, 0, 110, 0.15)',
  },
  medium: {
    border: 'border-neon-purple/40',
    bg: 'bg-neon-purple/5',
    text: 'text-neon-purple',
    glow: '0 0 20px rgba(157, 78, 221, 0.15)',
  },
  low: {
    border: 'border-neon-blue/40',
    bg: 'bg-neon-blue/5',
    text: 'text-neon-blue',
    glow: '0 0 20px rgba(0, 217, 255, 0.15)',
  },
};

export function UrgencyPulse({ message, severity = 'high', className = '' }: UrgencyPulseProps) {
  const s = severityStyles[severity];
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${s.border} ${s.bg} ${className}`}
      style={{ boxShadow: s.glow }}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <AlertCircle className={`w-4 h-4 ${s.text}`} />
      </motion.div>
      <span className={`text-xs font-bold ${s.text}`}>{message}</span>
    </motion.div>
  );
}
