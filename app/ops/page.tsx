'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuroraBackground } from '@/components/animations/AuroraBackground';
import { LuxuryParticles } from '@/components/animations/LuxuryParticles';
import { CursorSpotlight } from '@/components/animations/CursorSpotlight';
import { LuxuryCard } from '@/components/ui/LuxuryCard';
import { LuxuryMetric } from '@/components/ui/LuxuryMetric';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Zap, Play, Square, RefreshCw, Mail, Users, Package,
  DollarSign, Clock, AlertTriangle, ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface EngineData {
  status: {
    isRunning: boolean;
    lastHunt: string | null;
    totalCycles: number;
    uptime: string;
    errors: string[];
  };
  prospects: {
    total: number;
    found: number;
    contacted: number;
    replied: number;
    closed: number;
    topProspects: Array<{
      name: string;
      industry: string;
      painPoints: string[];
      score: number;
      estimatedValue: number;
      source: string;
    }>;
  };
  outreach: {
    totalSent: number;
    emailsSent: number;
    queued: number;
    recentEmails: Array<{
      to: string;
      subject: string;
      service: string;
      status: string;
      sentAt: string;
    }>;
  };
  deliveries: {
    totalDeliveries: number;
    totalRevenue: number;
    pending: number;
    inProgress: number;
    delivered: number;
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } },
};

export default function OpsPage() {
  const [data, setData] = useState<EngineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/engine');
      const json = await res.json();
      setData(json);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const triggerCycle = async () => {
    setActionLoading('cycle');
    try {
      const res = await fetch('/api/engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await res.json();
      setLogs((prev) => [
        `Cycle #${result.status.totalCycles} — ${result.hunt.found} prospects, ${result.outreach.sent} emails sent`,
        ...prev.slice(0, 20),
      ]);
      await fetchStatus();
    } catch (e) {
      setLogs((prev) => [`Error: ${(e as Error).message}`, ...prev.slice(0, 20)]);
    }
    setActionLoading(null);
  };

  const startEngine = async () => {
    setActionLoading('start');
    await fetch('/api/engine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', intervalMs: 300000 }),
    });
    setLogs((prev) => ['Engine started — running every 5 minutes', ...prev]);
    await fetchStatus();
    setActionLoading(null);
  };

  const stopEngine = async () => {
    setActionLoading('stop');
    await fetch('/api/engine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stop' }),
    });
    setLogs((prev) => ['Engine stopped', ...prev]);
    await fetchStatus();
    setActionLoading(null);
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-void)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gold/10 flex items-center justify-center"
          >
            <Zap className="w-8 h-8 text-gold" />
          </motion.div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted font-semibold">Loading</p>
        </motion.div>
      </div>
    );
  }

  const pipeline = (data?.prospects.topProspects || []).reduce((s, p) => s + p.estimatedValue, 0);
  const isRunning = data?.status.isRunning || false;

  return (
    <>
      <AuroraBackground />
      <LuxuryParticles />
      <CursorSpotlight />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-screen px-4 lg:px-8 xl:px-12 py-6 lg:py-8"
        style={{ zIndex: 10 }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Link href="/" className="btn-luxury flex items-center gap-2">
                  <ArrowLeft className="w-3.5 h-3.5" /> DASHBOARD
                </Link>
                <div>
                  <h1 className="text-2xl lg:text-4xl font-display font-black gold-shimmer">Engine Control</h1>
                  <p className="text-[11px] text-muted mt-1">Autonomous prospect hunting and outreach</p>
                </div>
              </div>
              <StatusBadge
                label={isRunning ? 'Running' : 'Standby'}
                active={isRunning}
                icon={<Zap className="w-3 h-3" />}
              />
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button onClick={triggerCycle} disabled={actionLoading === 'cycle'} className="btn-luxury flex items-center gap-2.5 disabled:opacity-40">
                <RefreshCw className={`w-3.5 h-3.5 ${actionLoading === 'cycle' ? 'animate-spin' : ''}`} /> RUN CYCLE NOW
              </button>
              {!isRunning ? (
                <button onClick={startEngine} disabled={actionLoading === 'start'} className="btn-luxury btn-teal flex items-center gap-2.5 disabled:opacity-40">
                  <Play className="w-3.5 h-3.5" /> START AUTOMATIC
                </button>
              ) : (
                <button onClick={stopEngine} disabled={actionLoading === 'stop'} className="btn-luxury flex items-center gap-2.5 disabled:opacity-40" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                  <Square className="w-3.5 h-3.5" /> STOP
                </button>
              )}
              <div className="ml-auto text-[10px] font-mono text-dim">
                {data?.status.totalCycles || 0} cycles · {data?.status.uptime || '0h 0m'}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <LuxuryMetric label="Prospects" value={data?.prospects.total || 0} icon={<Users className="w-4 h-4" />} accent="gold" delay={0.1} />
              <LuxuryMetric label="Emails Sent" value={data?.outreach.emailsSent || 0} icon={<Mail className="w-4 h-4" />} accent="violet" delay={0.2} />
              <LuxuryMetric label="Pipeline" value={pipeline} prefix="$" icon={<DollarSign className="w-4 h-4" />} accent="teal" delay={0.3} />
              <LuxuryMetric label="Deliveries" value={data?.deliveries.totalDeliveries || 0} icon={<Package className="w-4 h-4" />} accent="copper" delay={0.4} />
              <LuxuryMetric label="Cycles" value={data?.status.totalCycles || 0} icon={<Zap className="w-4 h-4" />} accent="gold" delay={0.5} />
            </div>
          </motion.div>

          {/* Two Column: Prospects + Outreach */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            <LuxuryCard glow="gold" delay={0.2}>
              <SectionHeader title="Top Prospects" subtitle="Real people found across the web" icon={<Users className="w-4 h-4" />} />
              <div className="space-y-2 max-h-80 overflow-y-auto panel-scroll">
                <AnimatePresence>
                  {(data?.prospects.topProspects || []).map((p, i) => (
                    <motion.div
                      key={p.name + i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:border-gold/20 transition-all duration-500"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-gold/10 flex items-center justify-center text-gold text-[10px] font-bold">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-warm">{p.name}</span>
                        </div>
                        <span className="text-[10px] font-bold text-teal font-mono">${p.estimatedValue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-dim">{p.industry} · {p.source}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-gold/10 text-gold-bright font-bold">{p.score}%</span>
                      </div>
                      {p.painPoints.length > 0 && (
                        <div className="flex gap-1 mt-1.5">
                          {p.painPoints.slice(0, 3).map((pp) => (
                            <span key={pp} className="text-[8px] px-1.5 py-0.5 rounded bg-violet/10 text-violet-bright">{pp}</span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {(!data?.prospects.topProspects || data.prospects.topProspects.length === 0) && (
                  <div className="text-center py-12">
                    <Users className="w-8 h-8 text-dim mx-auto mb-3 opacity-30" />
                    <p className="text-xs text-dim">No prospects yet. Run a cycle to start hunting.</p>
                  </div>
                )}
              </div>
            </LuxuryCard>

            <LuxuryCard glow="violet" delay={0.3}>
              <SectionHeader title="Recent Outreach" subtitle="Emails generated and queued" icon={<Mail className="w-4 h-4" />} />
              <div className="space-y-2 max-h-80 overflow-y-auto panel-scroll">
                <AnimatePresence>
                  {(data?.outreach.recentEmails || []).map((e, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:border-violet/20 transition-all duration-500"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-warm truncate max-w-[60%]">{e.to}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                          e.status === 'sent' ? 'bg-teal/10 text-teal' : 'bg-gold/10 text-gold'
                        }`}>{e.status}</span>
                      </div>
                      <p className="text-[11px] text-muted truncate">{e.subject}</p>
                      <p className="text-[9px] text-dim mt-1">{e.service} · {new Date(e.sentAt).toLocaleTimeString()}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {(!data?.outreach.recentEmails || data.outreach.recentEmails.length === 0) && (
                  <div className="text-center py-12">
                    <Mail className="w-8 h-8 text-dim mx-auto mb-3 opacity-30" />
                    <p className="text-xs text-dim">No outreach yet. Run a cycle to start sending.</p>
                  </div>
                )}
              </div>
            </LuxuryCard>
          </motion.div>

          {/* Activity Log + Errors */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
            <LuxuryCard className="lg:col-span-2" delay={0.4}>
              <SectionHeader title="Activity Log" icon={<Clock className="w-4 h-4" />} />
              <div className="space-y-1 max-h-48 overflow-y-auto font-mono text-[11px] panel-scroll">
                {logs.length === 0 && (
                  <p className="text-dim text-center py-4">No activity yet. Click "RUN CYCLE NOW" to start.</p>
                )}
                <AnimatePresence>
                  {logs.map((log, i) => (
                    <motion.div key={log + i} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-muted">
                      <span className="text-dim">{new Date().toLocaleTimeString()}</span> {log}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </LuxuryCard>

            <LuxuryCard delay={0.5}>
              <SectionHeader title="Errors" icon={<AlertTriangle className="w-4 h-4" />} />
              {data?.status.errors && data.status.errors.length > 0 ? (
                <div className="space-y-2">
                  {data.status.errors.map((err, i) => (
                    <div key={i} className="p-3 rounded-xl border border-red-500/10 bg-red-500/5">
                      <p className="text-[10px] text-red-300/70">{err}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-dim text-center py-6">No errors</p>
              )}
            </LuxuryCard>
          </motion.div>

          {/* Setup Guide */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <LuxuryCard glow="teal" delay={0.6}>
              <SectionHeader title="Activate Full Autonomy" subtitle="Add API keys to unlock real money mode" icon={<Zap className="w-4 h-4" />} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {[
                  { key: 'RESEND_API_KEY', desc: 'Emails actually get sent to real prospects', color: 'text-gold-bright' },
                  { key: 'PAYSTACK_SECRET_KEY', desc: 'Card payments processed worldwide', color: 'text-violet-bright' },
                  { key: 'GOOGLE_API_KEY', desc: 'More prospects found via Google search', color: 'text-teal' },
                ].map((item) => (
                  <div key={item.key} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <code className={`font-mono text-[11px] ${item.color} block mb-1.5`}>{item.key}</code>
                    <p className="text-[11px] text-dim">{item.desc}</p>
                  </div>
                ))}
              </div>
            </LuxuryCard>
          </motion.div>
        </div>
      </motion.main>
    </>
  );
}
