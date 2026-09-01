'use client';

import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';
import { formatCurrency } from '@/lib/revenue-tracker';
import type { Deal } from '@/types';
import { ArrowRight, Target } from 'lucide-react';

interface DealBoardProps {
  deals: Deal[];
}

const stageColors = {
  prospect: 'border-neon-blue/50 bg-neon-blue/5',
  engaged: 'border-neon-purple/50 bg-neon-purple/5',
  negotiating: 'border-neon-green/50 bg-neon-green/5',
  closed: 'border-neon-red/50 bg-neon-red/5',
  completed: 'border-neon-green/80 bg-neon-green/10',
};

const stageIcons = {
  prospect: '🎯',
  engaged: '💬',
  negotiating: '💰',
  closed: '✓',
  completed: '🎉',
};

export function DealBoard({ deals }: DealBoardProps) {
  const activeDealValue = deals
    .filter((d) => d.status === 'active')
    .reduce((sum, d) => sum + d.value, 0);

  const wonDealValue = deals
    .filter((d) => d.status === 'won')
    .reduce((sum, d) => sum + d.value, 0);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-lg border border-neon-blue/30">
          <p className="text-xs text-os-dim mb-2">ACTIVE PIPELINE</p>
          <p className="text-2xl font-bold text-neon-blue">{formatCurrency(activeDealValue)}</p>
        </div>
        <div className="glass-card p-4 rounded-lg border border-neon-green/30">
          <p className="text-xs text-os-dim mb-2">WON TODAY</p>
          <p className="text-2xl font-bold text-neon-green">{formatCurrency(wonDealValue)}</p>
        </div>
        <div className="glass-card p-4 rounded-lg border border-neon-purple/30">
          <p className="text-xs text-os-dim mb-2">TOTAL DEALS</p>
          <p className="text-2xl font-bold text-neon-purple">{deals.length}</p>
        </div>
      </motion.div>

      {/* Deals ticker */}
      <motion.div variants={itemVariants} className="space-y-2 max-h-96 overflow-y-auto">
        <h3 className="text-sm uppercase tracking-wider font-semibold text-neon-green mb-3">Live Deal Board</h3>
        {deals.slice(0, 8).map((deal, idx) => (
          <motion.div
            key={deal.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`glass-card p-3 rounded-lg border-l-4 flex items-center justify-between ${
              stageColors[deal.stage]
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-xl">{stageIcons[deal.stage]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{deal.prospect}</p>
                <p className="text-xs text-os-dim truncate">{deal.offer}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-3 flex-shrink-0">
              <div className="text-right">
                <p className="text-sm font-bold text-neon-green">{formatCurrency(deal.value)}</p>
                <p className="text-xs text-os-dim">{deal.probability}% prob</p>
              </div>
              <ArrowRight className="w-4 h-4 text-os-dim" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
