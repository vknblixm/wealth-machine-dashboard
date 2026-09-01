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
  green: 'neon-glow-green',
  red: 'neon-glow-red',
  blue: 'neon-glow-blue',
  purple: 'neon-glow-purple',
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
      className={`glass-card p-6 rounded-lg border border-neon-green/20 hover:border-neon-green/50 transition-all ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-os-dim mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${colorMap[color]} ${glowMap[color]}`}>
              {value}
            </span>
            {unit && <span className="text-sm text-os-dim">{unit}</span>}
          </div>
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
            isPositive ? 'bg-neon-green/10 text-neon-green' : 'bg-neon-red/10 text-neon-red'
          }`}>
            {isPositive ? (
              <ArrowUp className="w-4 h-4" />
            ) : (
              <ArrowDown className="w-4 h-4" />
            )}
            <span className="text-sm font-semibold">{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
