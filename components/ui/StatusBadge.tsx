'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatusBadgeProps {
  label: string;
  active: boolean;
  icon: ReactNode;
}

export function StatusBadge({ label, active, icon }: StatusBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-500 ${
        active
          ? 'border-gold/30 bg-gold/5'
          : 'border-dim/10 bg-surface/50'
      }`}
    >
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-gold-bright' : 'bg-dim'}`} />
        {active && (
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-gold-bright animate-ping opacity-50" />
        )}
      </div>
      <span className={`text-[11px] font-semibold uppercase tracking-wider ${
        active ? 'text-gold-bright' : 'text-dim'
      }`}>
        {icon}
      </span>
      <span className={`text-[11px] font-semibold uppercase tracking-wider ${
        active ? 'text-gold-bright' : 'text-dim'
      }`}>
        {label}
      </span>
    </motion.div>
  );
}
