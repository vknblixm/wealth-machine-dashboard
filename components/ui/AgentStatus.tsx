'use client';

import { motion } from 'framer-motion';
import { getStatusColor } from '@/lib/colors';
import type { Agent } from '@/types';

interface AgentStatusProps {
  agent: Agent;
  compact?: boolean;
}

const statusEmoji: Record<Agent['status'], string> = {
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
      className="flex items-center gap-2"
    >
      <div
        className="w-2.5 h-2.5 rounded-full"
        style={{
          backgroundColor: statusColor,
          boxShadow: `0 0 6px ${statusColor}`,
        }}
      />
      <span className="text-xs">
        {statusEmoji[agent.status]}{' '}
        {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
      </span>
      {!compact && (
        <span className="text-[10px] text-os-dim ml-auto">
          {agent.dealsThisHour} deals/h
        </span>
      )}
    </motion.div>
  );
}
