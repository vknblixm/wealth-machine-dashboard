'use client';

import { motion } from 'framer-motion';
import { getStatusColor } from '@/lib/colors';
import type { Agent } from '@/types';

interface AgentStatusProps {
  agent: Agent;
  compact?: boolean;
}

const statusEmoji = {
  active: '🟢',
  hunting: '🎯',
  closing: '💰',
  idle: '⏸️',
  error: '🔴',
};

export function AgentStatus({ agent, compact = false }: AgentStatusProps) {
  const statusColor = getStatusColor(agent.status);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3"
    >
      <div
        className="w-3 h-3 rounded-full animate-pulse-glow"
        style={{ backgroundColor: statusColor }}
      />
      <span className="text-sm">
        {statusEmoji[agent.status]} {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
      </span>
      {!compact && (
        <span className="text-xs text-os-dim ml-auto">
          {agent.dealsThisHour} deals/h
        </span>
      )}
    </motion.div>
  );
}
