'use client';

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface UrgencyPulseProps {
  message: string;
  severity?: 'high' | 'medium' | 'low';
  className?: string;
}

const severityColors = {
  high: 'border-neon-red/50 bg-neon-red/10 text-neon-red',
  medium: 'border-neon-purple/50 bg-neon-purple/10 text-neon-purple',
  low: 'border-neon-blue/50 bg-neon-blue/10 text-neon-blue',
};

export function UrgencyPulse({
  message,
  severity = 'high',
  className = '',
}: UrgencyPulseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${severityColors[severity]} ${className}`}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <AlertCircle className="w-5 h-5" />
      </motion.div>
      <span className="text-sm font-semibold">{message}</span>
    </motion.div>
  );
}
