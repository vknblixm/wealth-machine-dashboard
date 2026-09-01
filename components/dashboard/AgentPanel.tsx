'use client';

import { motion } from 'framer-motion';
import { cardVariants, containerVariants, itemVariants } from '@/lib/animations';
import { formatCurrency } from '@/lib/revenue-tracker';
import type { Agent } from '@/types';
import { AgentStatus } from '../ui/AgentStatus';
import { Slider } from '@/components/ui/Slider';
import { Activity, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface AgentPanelProps {
  agent: Agent;
  onAutonomyChange?: (level: number) => void;
  isSelected?: boolean;
  onClick?: () => void;
}

export function AgentPanel({
  agent,
  onAutonomyChange,
  isSelected = false,
  onClick,
}: AgentPanelProps) {
  const [autonomy, setAutonomy] = useState(agent.autonomyLevel);

  const handleAutonomyChange = (value: number) => {
    setAutonomy(value);
    onAutonomyChange?.(value);
  };

  const progressPercentage = (agent.dailyActual / agent.dailyTarget) * 100;

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      onClick={onClick}
      className={`glass-card p-6 rounded-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-neon-green bg-neon-green/5'
          : 'border-neon-green/20 hover:border-neon-green/50'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">{agent.name}</h3>
          <AgentStatus agent={agent} compact={false} />
        </div>
        <motion.div
          animate={{ rotate: agent.status === 'hunting' ? 360 : 0 }}
          transition={{ duration: 2, repeat: agent.status === 'hunting' ? Infinity : 0 }}
        >
          <Activity className="w-6 h-6 text-neon-green" />
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-os-dim">DAILY TARGET</span>
          <span className="text-sm font-semibold text-neon-green">{progressPercentage.toFixed(0)}%</span>
        </div>
        <div className="relative h-2 bg-dark-surface rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-neon-green to-neon-blue"
            style={{
              boxShadow: '0 0 15px rgba(0, 255, 65, 0.5)',
            }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-neon-green/10"
      >
        <motion.div variants={itemVariants} className="text-sm">
          <p className="text-xs text-os-dim mb-1">ACTUAL TODAY</p>
          <p className="font-bold text-neon-green">{formatCurrency(agent.dailyActual)}</p>
        </motion.div>
        <motion.div variants={itemVariants} className="text-sm">
          <p className="text-xs text-os-dim mb-1">CONVERSION</p>
          <p className="font-bold text-neon-blue">{agent.conversionRate.toFixed(1)}%</p>
        </motion.div>
        <motion.div variants={itemVariants} className="text-sm">
          <p className="text-xs text-os-dim mb-1">EFFICIENCY</p>
          <p className="font-bold text-neon-purple">{agent.efficiency.toFixed(0)}%</p>
        </motion.div>
        <motion.div variants={itemVariants} className="text-sm">
          <p className="text-xs text-os-dim mb-1">TOTAL REVENUE</p>
          <p className="font-bold text-neon-red">{formatCurrency(agent.totalRevenue)}</p>
        </motion.div>
      </motion.div>

      {/* Autonomy Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase tracking-wider text-os-dim">AUTONOMY LEVEL</label>
          <span className="text-sm font-semibold text-neon-green">{autonomy}%</span>
        </div>
        <Slider
          value={autonomy}
          onChange={handleAutonomyChange}
          min={0}
          max={100}
          className="w-full"
        />
      </div>

      {/* Aggressiveness indicator */}
      <div className="mt-4 pt-4 border-t border-neon-green/10">
        <p className="text-xs text-os-dim mb-2">AGGRESSIVENESS</p>
        <div className="flex gap-1">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: i < (agent.aggressiveness / 10) ? 1 : 0.3 }}
              className="h-1 flex-1 rounded-full bg-neon-green"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
