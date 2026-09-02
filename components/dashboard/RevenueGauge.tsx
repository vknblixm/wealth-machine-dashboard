'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { containerVariants, itemVariants } from '@/lib/animations';
import { formatCurrency } from '@/lib/revenue-tracker';
import type { Revenue } from '@/types';
import { Zap } from 'lucide-react';

interface RevenueGaugeProps {
  revenue: Revenue | null;
}

export function RevenueGauge({ revenue }: RevenueGaugeProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevRevenueRef = useRef(0);

  useEffect(() => {
    if (!revenue) return;
    const target = revenue.totalThisHour;
    const start = prevRevenueRef.current || displayValue;
    prevRevenueRef.current = target;

    let frame: number;
    const startTime = Date.now();
    const duration = 800;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(start + (target - start) * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [revenue]);

  if (!revenue) return null;

  const percentage = Math.min((displayValue / (revenue.totalThisHour || 1)) * 100, 100);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Main Revenue Gauge */}
      <motion.div
        variants={itemVariants}
        className="glass-card p-6 lg:p-8 rounded-xl border border-neon-green/20 relative overflow-hidden"
      >
        {/* Animated background gradient sweep */}
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(0,255,65,0.3), transparent 60%)',
              'radial-gradient(circle at 80% 50%, rgba(0,217,255,0.3), transparent 60%)',
              'radial-gradient(circle at 20% 50%, rgba(0,255,65,0.3), transparent 60%)',
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-os-dim mb-2">
                Revenue This Hour
              </p>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="text-4xl lg:text-6xl font-black text-neon-green"
                style={{
                  textShadow: '0 0 20px rgba(0,255,65,0.5), 0 0 40px rgba(0,255,65,0.25)',
                }}
              >
                {formatCurrency(displayValue)}
              </motion.div>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="text-neon-green"
            >
              <Zap className="w-10 h-10 lg:w-14 lg:h-14" />
            </motion.div>
          </div>

          {/* Gauge bar */}
          <div className="relative h-3 bg-dark-surface rounded-full overflow-hidden border border-neon-green/15">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #00ff41, #00d9ff, #9d4edd)',
                boxShadow: '0 0 20px rgba(0, 255, 65, 0.6), 0 0 40px rgba(0, 255, 65, 0.2)',
              }}
            />
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
              }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-5 border-t border-neon-green/10">
          {[
            { label: 'Today', value: formatCurrency(revenue.totalToday), color: 'text-neon-green' },
            { label: 'This Month', value: formatCurrency(revenue.totalThisMonth), color: 'text-neon-blue' },
            { label: 'Growth Rate', value: `${revenue.growthRate.toFixed(1)}%`, color: 'text-neon-purple' },
            { label: 'All Time', value: formatCurrency(revenue.totalAllTime), color: 'text-neon-red' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-[9px] uppercase tracking-widest text-os-dim mb-1">{stat.label}</p>
              <p className={`text-sm lg:text-base font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Revenue Streams */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-neon-green">
          Revenue Streams
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {revenue.streams.map((stream, idx) => (
            <motion.div
              key={stream.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="glass-card p-4 rounded-lg border border-neon-green/10 hover:border-neon-green/30 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-os-dim">
                  {stream.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green font-semibold">
                  {stream.status}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-neon-green">
                  {formatCurrency(stream.hourlyActual)}
                  <span className="text-[10px] text-os-dim ml-1">/hr</span>
                </span>
                <span className="text-[10px] text-neon-green">
                  +{stream.growthRate.toFixed(1)}%
                </span>
              </div>
              {/* Mini progress bar */}
              <div className="mt-2 h-1 bg-dark-surface rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((stream.hourlyActual / stream.hourlyTarget) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, #00ff41, ${idx % 2 === 0 ? '#00d9ff' : '#9d4edd'})` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[8px] text-os-dim">
                  Target: {formatCurrency(stream.hourlyTarget)}/hr
                </span>
                <span className="text-[8px] text-os-dim">
                  Margin: {stream.margin}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
