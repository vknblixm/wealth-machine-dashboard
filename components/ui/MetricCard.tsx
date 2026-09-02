'use client';

import { motion } from 'framer-motion';
import { cardVariants } from '@/lib/animations';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  change?: number;
  isPositive?: boolean;
  color?: 'green' | 'red' | 'blue' | 'purple';
  className?: string;
}

const colorMap = {
  green: 'text-neon-green',
  red: 'text-neon-red',
  blue: 'text-neon-blue',
  purple: 'text-neon-purple',
};

const glowMap = {
  green: 'drop-shadow-[0_0_8px_rgba(0,255,65,0.6)]',
  red: 'drop-shadow-[0_0_8px_rgba(255,0,110,0.6)]',
  blue: 'drop-shadow-[0_0_8px_rgba(0,217,255,0.6)]',
  purple: 'drop-shadow-[0_0_8px_rgba(157,78,221,0.6)]',
};

const borderColorMap = {
  green: 'border-neon-green/20 hover:border-neon-green/50',
  red: 'border-neon-red/20 hover:border-neon-red/50',
  blue: 'border-neon-blue/20 hover:border-neon-blue/50',
  purple: 'border-neon-purple/20 hover:border-neon-purple/50',
};

export function MetricCard({
  title,
  value,
  unit = '',
  change,
  isPositive = true,
  color = 'green',
  className = '',
}: MetricCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className={`glass-card p-4 rounded-lg border transition-all ${borderColorMap[color]} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-os-dim mb-1">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold ${colorMap[color]} ${glowMap[color]}`}>
              {value}
            </span>
            {unit && <span className="text-xs text-os-dim">{unit}</span>}
          </div>
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
              isPositive
                ? 'bg-neon-green/10 text-neon-green'
                : 'bg-neon-red/10 text-neon-red'
            }`}
          >
            {isPositive ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
    </motion.div>
  );
}
