'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  delay?: number;
}

export function SectionHeader({ title, subtitle, icon, delay = 0 }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
      className="mb-5"
    >
      <div className="flex items-center gap-3 mb-1">
        {icon && <span className="text-gold">{icon}</span>}
        <h2 className="text-sm font-bold font-display uppercase tracking-[0.15em] text-gold-bright">
          {title}
        </h2>
      </div>
      {subtitle && <p className="text-[11px] text-muted ml-8">{subtitle}</p>}
      <div className="luxury-divider mt-3" />
    </motion.div>
  );
}
