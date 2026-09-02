'use client';

import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';
import { formatCurrency } from '@/lib/revenue-tracker';
import type { Deal } from '@/types';
import { ArrowRight } from 'lucide-react';

interface DealBoardProps {
  deals: Deal[];
}

const stageConfig: Record<Deal['stage'], { color: string; border: string; bg: string; icon: string }> = {
  prospect: { color: 'text-neon-blue', border: 'border-neon-blue/50', bg: 'bg-neon-blue/5', icon: '🎯' },
  engaged: { color: 'text-neon-purple', border: 'border-neon-purple/50', bg: 'bg-neon-purple/5', icon: '💬' },
  negotiating: { color: 'text-neon-green', border: 'border-neon-green/50', bg: 'bg-neon-green/5', icon: '💰' },
  closed: { color: 'text-neon-red', border: 'border-neon-red/50', bg: 'bg-neon-red/5', icon: '✓' },
  completed: { color: 'text-neon-green', border: 'border-neon-green/80', bg: 'bg-neon-green/10', icon: '🎉' },
};

export function DealBoard({ deals }: DealBoardProps) {
  const activeDealValue = deals
    .filter((d) => d.status === 'active')
    .reduce((sum, d) => sum + d.value, 0);

  const wonDealValue = deals
    .filter((d) => d.status === 'won')
    .reduce((sum, d) => sum + d.value, 0);

  const pipelineDeals = deals.filter((d) => d.status === 'active');

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Summary cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 rounded-lg border border-neon-blue/20 text-center">
          <p className="text-[8px] uppercase tracking-wider text-os-dim mb-1">Active Pipeline</p>
          <p className="text-lg font-bold text-neon-blue">{formatCurrency(activeDealValue)}</p>
        </div>
        <div className="glass-card p-3 rounded-lg border border-neon-green/20 text-center">
          <p className="text-[8px] uppercase tracking-wider text-os-dim mb-1">Won Today</p>
          <p className="text-lg font-bold text-neon-green">{formatCurrency(wonDealValue)}</p>
        </div>
        <div className="glass-card p-3 rounded-lg border border-neon-purple/20 text-center">
          <p className="text-[8px] uppercase tracking-wider text-os-dim mb-1">Total Deals</p>
          <p className="text-lg font-bold text-neon-purple">{deals.length}</p>
        </div>
      </motion.div>

      {/* Deals list */}
      <motion.div variants={itemVariants} className="space-y-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
        <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-neon-green mb-2">
          Live Deal Board
        </h3>
        {pipelineDeals.map((deal, idx) => {
          const cfg = stageConfig[deal.stage];
          return (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.3 }}
              whileHover={{ x: 4, backgroundColor: 'rgba(0, 255, 65, 0.03)' }}
              className={`glass-card p-3 rounded-lg border-l-4 ${cfg.border} ${cfg.bg} flex items-center justify-between transition-all`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-lg flex-shrink-0">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{deal.prospect}</p>
                  <p className="text-[10px] text-os-dim truncate">{deal.offer}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                <div className="text-right">
                  <p className="text-xs font-bold text-neon-green">{formatCurrency(deal.value)}</p>
                  <p className="text-[9px] text-os-dim">{deal.probability}% prob</p>
                </div>
                <ArrowRight className="w-3 h-3 text-os-dim" />
              </div>
            </motion.div>
          );
        })}

        {pipelineDeals.length === 0 && (
          <p className="text-xs text-os-dim text-center py-8">No active deals in pipeline</p>
        )}
      </motion.div>
    </motion.div>
  );
}
