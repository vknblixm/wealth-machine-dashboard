'use client';

import { motion } from 'framer-motion';

interface LuxuryProgressProps {
  value: number;
  max?: number;
  label?: string;
  accent?: 'gold' | 'violet' | 'teal';
  height?: number;
  delay?: number;
}

const accentGradients = {
  gold: 'linear-gradient(90deg, #6b5a2a, #c9a84c, #f0d078)',
  violet: 'linear-gradient(90deg, #4c1d95, #7c3aed, #a78bfa)',
  teal: 'linear-gradient(90deg, #0d9488, #2dd4bf, #5eead4)',
};

export function LuxuryProgress({ value, max = 100, label, accent = 'gold', height = 4, delay = 0 }: LuxuryProgressProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">{label}</span>
          <span className="text-[11px] font-bold text-warm">{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: `${height}px`, background: 'rgba(255,255,255,0.04)' }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay, ease: [0.23, 1, 0.32, 1] }}
          className="h-full rounded-full"
          style={{ background: accentGradients[accent] }}
        />
      </div>
    </div>
  );
}
