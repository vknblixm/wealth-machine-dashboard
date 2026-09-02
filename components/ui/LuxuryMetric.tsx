'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { AnimatedCounter } from './AnimatedCounter';

interface LuxuryMetricProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon: ReactNode;
  accent: 'gold' | 'violet' | 'teal' | 'copper';
  delay?: number;
}

const accentColors = {
  gold: {
    text: 'text-gold-bright',
    border: 'border-gold/20',
    bg: 'bg-gold/5',
    iconBg: 'bg-gold/10',
    gradient: 'from-gold/10 to-transparent',
  },
  violet: {
    text: 'text-violet-bright',
    border: 'border-violet/20',
    bg: 'bg-violet/5',
    iconBg: 'bg-violet/10',
    gradient: 'from-violet/10 to-transparent',
  },
  teal: {
    text: 'text-teal',
    border: 'border-teal/20',
    bg: 'bg-teal/5',
    iconBg: 'bg-teal/10',
    gradient: 'from-teal/10 to-transparent',
  },
  copper: {
    text: 'text-copper',
    border: 'border-copper/20',
    bg: 'bg-copper/5',
    iconBg: 'bg-copper/10',
    gradient: 'from-copper/10 to-transparent',
  },
};

export function LuxuryMetric({ label, value, prefix = '', suffix = '', decimals = 0, icon, accent, delay = 0 }: LuxuryMetricProps) {
  const c = accentColors[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: [0.23, 1, 0.32, 1] }}
      className={`luxury-glass p-5 relative overflow-hidden group`}
    >
      {/* Gradient accent on top */}
      <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${c.gradient} opacity-50`} />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
            {label}
          </p>
          <div className={`w-8 h-8 rounded-xl ${c.iconBg} flex items-center justify-center`}>
            <span className={c.text}>{icon}</span>
          </div>
        </div>

        <AnimatedCounter
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          className={`text-3xl font-black font-display ${c.text}`}
        />
      </div>
    </motion.div>
  );
}
