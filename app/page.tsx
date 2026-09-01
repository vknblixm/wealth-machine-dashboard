'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDashboardStore } from '@/lib/store';
import { generateRevenueData } from '@/lib/revenue-tracker';
import { generateAgents, simulateAgentActivity } from '@/lib/agent-simulator';
import { RevenueGauge } from '@/components/dashboard/RevenueGauge';
import { AgentPanel } from '@/components/dashboard/AgentPanel';
import { DealBoard } from '@/components/dashboard/DealBoard';
import { OfferHeatmap } from '@/components/dashboard/OfferHeatmap';
import { FloatingMoney } from '@/components/animations/FloatingMoney';
import { MoneyFlowCanvas } from '@/components/animations/MoneyFlowCanvas';
import { UrgencyPulse } from '@/components/ui/UrgencyPulse';
import { containerVariants, itemVariants } from '@/lib/animations';
import { Zap, Activity, Target, TrendingUp } from 'lucide-react';
import type { Agent, Deal } from '@/types';

export default function HomePage() {
  const {
    revenue,
    updateRevenue,
    agents,
    updateAgents,
    updateAgent,
    setAgentAutonomy,
    deals,
    updateDeals,
    selectedAgent,
    setSelectedAgent,
    timeframe,
    setTimeframe,
  } = useDashboardStore();

  const [loading, setLoading] = useState(true);
  const [topDeals, setTopDeals] = useState<Deal[]>([]);

  // Initialize data
  useEffect(() => {
    const revenueData = generateRevenueData();
    updateRevenue(revenueData);

    const agentList = generateAgents();
    updateAgents(agentList);

    // Generate mock deals
    const mockDeals: Deal[] = [
      {
        id: 'deal-1',
        agentId: 'agent-1',
        prospect: 'TechCorp Inc',
        offer: 'High-Ticket Consulting',
        value: 25000,
        stage: 'negotiating',
        status: 'active',
        probability: 85,
        timeInStage: 2,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'deal-2',
        agentId: 'agent-2',
        prospect: 'StartupXYZ',
        offer: 'Digital Product Bundle',
        value: 5000,
        stage: 'closed',
        status: 'won',
        probability: 100,
        timeInStage: 0.5,
        createdAt: new Date().toISOString(),
        closedAt: new Date().toISOString(),
      },
      {
        id: 'deal-3',
        agentId: 'agent-4',
        prospect: 'Enterprise Solutions',
        offer: 'Partnership Deal',
        value: 50000,
        stage: 'engaged',
        status: 'active',
        probability: 65,
        timeInStage: 1,
        createdAt: new Date().toISOString(),
      },
    ];

    updateDeals(mockDeals);
    setTopDeals(mockDeals.sort((a, b) => b.value - a.value).slice(0, 3));
    setLoading(false);
  }, [updateRevenue, updateAgents, updateDeals]);

  // Simulate agent activity
  useEffect(() => {
    const interval = setInterval(() => {
      agents.forEach((agent) => {
        const updates = simulateAgentActivity(agent);
        updateAgent(agent.id, updates);
      });

      // Update revenue every 2 seconds
      const newRevenue = generateRevenueData();
      updateRevenue(newRevenue);
    }, 2000);

    return () => clearInterval(interval);
  }, [agents, updateAgent, updateRevenue]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-neon-green text-4xl"
        >
          <Zap className="w-12 h-12" />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Background animations */}
      <FloatingMoney />
      <MoneyFlowCanvas />

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen bg-gradient-to-b from-dark-bg via-dark-surface to-dark-bg p-6 lg:p-8"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-black neon-glow-green mb-2">WEALTH MACHINE</h1>
              <p className="text-neon-blue text-sm uppercase tracking-widest">🔥 Ruthless Money Hunter Operating System</p>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <Zap className="w-16 h-16 text-neon-green" />
            </motion.div>
          </div>

          {/* Timeframe selector */}
          <div className="flex gap-2 mb-4">
            {(['1h', '1d', '7d', '30d'] as const).map((tf) => (
              <motion.button
                key={tf}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  timeframe === tf
                    ? 'bg-neon-green text-dark-bg'
                    : 'bg-dark-card border border-neon-green/30 text-neon-green hover:border-neon-green'
                }`}
              >
                {tf}
              </motion.button>
            ))}
          </div>

          {/* Urgency alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <UrgencyPulse
              message="🔥 4 deals closing TODAY - $125k pipeline"
              severity="high"
            />
            <UrgencyPulse
              message="📈 Growth rate: +18.5% this hour"
              severity="medium"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Main Revenue Gauge - Takes 2 columns on large screens */}
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <RevenueGauge revenue={revenue} />
          </motion.div>

          {/* Key Metrics */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="glass-card p-6 rounded-lg border border-neon-green/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-wider text-os-dim">ACTIVE AGENTS</p>
                <Activity className="w-5 h-5 text-neon-green" />
              </div>
              <p className="text-4xl font-bold neon-glow-green">{agents.filter(a => a.status !== 'idle').length}/8</p>
              <p className="text-xs text-os-dim mt-2">Hunting relentlessly</p>
            </div>

            <div className="glass-card p-6 rounded-lg border border-neon-blue/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-wider text-os-dim">TOTAL DEALS</p>
                <Target className="w-5 h-5 text-neon-blue" />
              </div>
              <p className="text-4xl font-bold neon-glow-blue">{deals.length}</p>
              <p className="text-xs text-os-dim mt-2">Pipeline value: $80k+</p>
            </div>

            <div className="glass-card p-6 rounded-lg border border-neon-purple/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-wider text-os-dim">EFFICIENCY</p>
                <TrendingUp className="w-5 h-5 text-neon-purple" />
              </div>
              <p className="text-4xl font-bold neon-glow-purple">{(agents.reduce((sum, a) => sum + a.efficiency, 0) / agents.length).toFixed(0)}%</p>
              <p className="text-xs text-os-dim mt-2">Team average</p>
            </div>
          </motion.div>
        </div>

        {/* Deals & Offers */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DealBoard deals={deals} />
          <OfferHeatmap revenue={revenue} />
        </motion.div>

        {/* Agents Grid */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-2xl font-bold text-neon-green mb-4">AI AGENT SQUAD</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {agents.map((agent, idx) => (
              <motion.div
                key={agent.id}
                variants={itemVariants}
                transition={{ delay: idx * 0.1 }}
              >
                <AgentPanel
                  agent={agent}
                  isSelected={selectedAgent === agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  onAutonomyChange={(level) => setAgentAutonomy(agent.id, level)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer Stats */}
        <motion.div
          variants={itemVariants}
          className="glass-card p-6 rounded-lg border border-neon-green/20 text-center"
        >
          <p className="text-sm uppercase tracking-widest text-os-dim mb-2">System Status</p>
          <p className="text-xl font-bold text-neon-green mb-2">🟢 ALL SYSTEMS OPTIMAL</p>
          <p className="text-xs text-os-dim">Agents hunting • Deals closing • Revenue flowing • Wealth compounding</p>
        </motion.div>
      </motion.main>
    </>
  );
}
