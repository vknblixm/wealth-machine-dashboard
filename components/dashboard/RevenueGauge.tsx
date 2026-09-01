'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { containerVariants, itemVariants } from '@/lib/animations';
import { formatCurrency } from '@/lib/revenue-tracker';
import type { Revenue } from '@/types';
import { MetricCard } from '../ui/MetricCard';
import { TrendingUp, Zap } from 'lucide-react';

interface RevenueGaugeProps {
  revenue: Revenue | null;
}

export function RevenueGauge({ revenue }: RevenueGaugeProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!revenue) return;
    
    const interval = setInterval(() => {
      setDisplayValue((prev) => {
        const target = revenue.totalThisHour;
        const diff = target - prev;
        return prev + diff * 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [revenue]);

  if (!revenue) return null;

  const percentage = Math.min((displayValue / revenue.totalThisHour) * 100, 100);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Main Revenue Gauge */}
      <motion.div
        variants={itemVariants}
        className="glass-card p-8 rounded-lg border border-neon-green/30 overflow-hidden"
      >
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-os-dim mb-1">REVENUE THIS HOUR</p>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-bold neon-glow-green"
              >
                {formatCurrency(displayValue)}
              </motion.div>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Zap className="w-12 h-12 text-neon-green" />
            </motion.div>
          </div>

          {/* Gauge bar */}
          <div className="relative h-2 bg-dark-surface rounded-full overflow-hidden border border-neon-green/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-neon-green to-neon-blue rounded-full"
              style={{
                boxShadow: '0 0 20px rgba(0, 255, 65, 0.6)',
              }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-neon-green/10"
        >
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-xs text-os-dim mb-1">TODAY</p>
            <p className="text-lg font-bold text-neon-green">{formatCurrency(revenue.totalToday)}</p>
          </motion.div>
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-xs text-os-dim mb-1">THIS MONTH</p>
            <p className="text-lg font-bold text-neon-blue">{formatCurrency(revenue.totalThisMonth)}</p>
          </motion.div>
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-xs text-os-dim mb-1">GROWTH RATE</p>
            <p className="text-lg font-bold text-neon-purple">{revenue.growthRate.toFixed(1)}%</p>
          </motion.div>
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-xs text-os-dim mb-1">ALL TIME</p>
            <p className="text-lg font-bold text-neon-red">{formatCurrency(revenue.totalAllTime)}</p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Revenue Streams */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h3 className="text-sm uppercase tracking-wider font-semibold text-neon-green">Revenue Streams</h3>
        <div className="grid grid-cols-2 gap-3">
          {revenue.streams.map((stream) => (
            <MetricCard
              key={stream.id}
              title={stream.name}
              value={formatCurrency(stream.hourlyActual)}
              unit="/hr"
              change={stream.growthRate}
              isPositive={true}
              color="green"
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
