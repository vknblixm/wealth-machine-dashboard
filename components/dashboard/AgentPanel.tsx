'use client';

import { motion } from 'framer-motion';
import { cardVariants } from '@/lib/animations';
import { formatCurrency } from '@/lib/revenue-tracker';
import type { Agent } from '@/types';
import { AgentStatus } from '../ui/AgentStatus';
import { NeonSlider } from '../ui/NeonSlider';
import { Activity } from 'lucide-react';

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
  const progressPercentage = (agent.dailyActual / agent.dailyTarget) * 100;

  const statusGlow: Record<Agent['status'], string> = {
    active: '0 0 15px rgba(0, 255, 65, 0.2)',
    hunting: '0 0 15px rgba(0, 217, 255, 0.2)',
    closing: '0 0 15px rgba(157, 78, 221, 0.2)',
    idle: 'none',
    error: '0 0 15px rgba(255, 0, 110, 0.2)',
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      onClick={onClick}
      className={`glass-card p-5 rounded-xl border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-neon-green bg-neon-green/5'
          : 'border-neon-green/15 hover:border-neon-green/40'
      }`}
      style={{ boxShadow: isSelected ? statusGlow.hunting : undefined }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white truncate">{agent.name}</h3>
          <div className="mt-1">
            <AgentStatus agent={agent} compact={false} />
          </div>
        </div>
        <motion.div
          animate={{
            rotate: agent.status === 'hunting' ? 360 : 0,
          }}
          transition={{ duration: 2, repeat: agent.status === 'hunting' ? Infinity : 0 }}
        >
          <Activity className="w-5 h-5 text-neon-green flex-shrink-0 ml-2" />
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] uppercase tracking-widest text-os-dim">Daily Target</span>
          <span className="text-xs font-bold text-neon-green">
            {progressPercentage.toFixed(0)}%
          </span>
        </div>
        <div className="relative h-1.5 bg-dark-surface rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
            transition={{ duration: 0.6 }}
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #00ff41, #00d9ff)',
              boxShadow: '0 0 10px rgba(0, 255, 65, 0.5)',
            }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-3 pb-3 border-b border-neon-green/10">
        {[
          { label: 'Actual Today', value: formatCurrency(agent.dailyActual), color: 'text-neon-green' },
          { label: 'Conversion', value: `${agent.conversionRate.toFixed(1)}%`, color: 'text-neon-blue' },
          { label: 'Efficiency', value: `${agent.efficiency.toFixed(0)}%`, color: 'text-neon-purple' },
          { label: 'Total Rev', value: formatCurrency(agent.totalRevenue), color: 'text-neon-red' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-[8px] uppercase tracking-wider text-os-dim mb-0.5">{stat.label}</p>
            <p className={`text-xs font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Autonomy Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[9px] uppercase tracking-widest text-os-dim">Autonomy</label>
          <span className="text-[10px] font-bold text-neon-green">{agent.autonomyLevel}%</span>
        </div>
        <NeonSlider
          value={agent.autonomyLevel}
          onChange={(v) => onAutonomyChange?.(v)}
          min={0}
          max={100}
        />
      </div>

      {/* Aggressiveness indicator */}
      <div className="mt-3 pt-3 border-t border-neon-green/10">
        <p className="text-[8px] uppercase tracking-wider text-os-dim mb-1.5">Aggressiveness</p>
        <div className="flex gap-0.5">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="h-1.5 flex-1 rounded-full"
              style={{
                backgroundColor: i < agent.aggressiveness / 10
                  ? '#00ff41'
                  : 'rgba(255,255,255,0.08)',
                boxShadow: i < agent.aggressiveness / 10
                  ? '0 0 4px rgba(0, 255, 65, 0.5)'
                  : undefined,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
