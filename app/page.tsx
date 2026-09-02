'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuroraBackground } from '@/components/animations/AuroraBackground';
import { LuxuryParticles } from '@/components/animations/LuxuryParticles';
import { CursorSpotlight } from '@/components/animations/CursorSpotlight';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { LuxuryCard } from '@/components/ui/LuxuryCard';
import { LuxuryMetric } from '@/components/ui/LuxuryMetric';
import { LuxuryProgress } from '@/components/ui/LuxuryProgress';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Zap, TrendingUp, DollarSign, Users, Mail, Target, Play, Square, RefreshCw, ExternalLink, ArrowUpRight, Sparkles, Shield } from 'lucide-react';
import Link from 'next/link';

interface EngineData {
  status: { isRunning: boolean; lastHunt: string | null; totalCycles: number; uptime: string; errors: string[] };
  prospects: { total: number; found: number; contacted: number; replied: number; closed: number;
    topProspects: Array<{ name: string; industry: string; painPoints: string[]; score: number; estimatedValue: number; source: string }> };
  outreach: { totalSent: number; emailsSent: number; queued: number;
    recentEmails: Array<{ to: string; subject: string; service: string; status: string; sentAt: string }> };
  deliveries: { totalDeliveries: number; totalRevenue: number; pending: number; inProgress: number; delivered: number };
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } },
};

export default function HomePage() {
  const [data, setData] = useState<EngineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [time, setTime] = useState('');

  const fetchStatus = useCallback(async () => {
    try {
      const r = await fetch('/api/engine');
      const j = await r.json();
      setData(j);
      setLoading(false);
    } catch { setLoading(false); }
  }, []);

  const triggerCycle = async () => {
    setActionLoading('cycle');
    try {
      await fetch('/api/engine', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      await fetchStatus();
    } catch {}
    setActionLoading(null);
  };

  const startEngine = async () => {
    setActionLoading('start');
    await fetch('/api/engine', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'start', intervalMs: 300000 }) });
    await fetchStatus();
    setActionLoading(null);
  };

  const stopEngine = async () => {
    setActionLoading('stop');
    await fetch('/api/engine', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'stop' }) });
    await fetchStatus();
    setActionLoading(null);
  };

  useEffect(() => {
    fetchStatus();
    const i = setInterval(fetchStatus, 8000);
    return () => clearInterval(i);
  }, [fetchStatus]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, []);

  const pipeline = (data?.prospects.topProspects || []).reduce((s, p) => s + p.estimatedValue, 0);
  const isRunning = data?.status.isRunning || false;

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
            <Sparkles className="w-8 h-8 text-gold" />
          </motion.div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted font-semibold">Initializing</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <AuroraBackground />
      <LuxuryParticles />
      <CursorSpotlight />

      <motion.main
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative min-h-screen px-4 lg:px-8 xl:px-12 py-6 lg:py-8"
        style={{ zIndex: 10 }}
      >
        {/* ═══ HEADER ═══ */}
        <motion.header variants={fadeUp} className="mb-8 lg:mb-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <motion.h1
                  className="text-4xl lg:text-6xl xl:text-7xl font-display font-black gold-shimmer tracking-tight"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                >
                  PulseRevenue
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className="hidden sm:block"
                >
                  <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center animate-glow-pulse">
                    <Sparkles className="w-5 h-5 text-gold-bright" />
                  </div>
                </motion.div>
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-sm text-muted tracking-wide max-w-lg"
              >
                Autonomous AI revenue engine — hunting prospects, closing deals, generating income while you sleep.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-2"
            >
              <span className="font-mono text-[11px] text-dim mr-3">{time}</span>
              <Link href="/ops" className="btn-luxury flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" /> ENGINE <ExternalLink className="w-3 h-3 opacity-50" />
              </Link>
              <Link href="/sell" className="btn-violet btn-luxury flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" /> SELL <ExternalLink className="w-3 h-3 opacity-50" />
              </Link>
            </motion.div>
          </div>

          {/* Engine Controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center gap-3 mb-6"
          >
            <button
              onClick={triggerCycle}
              disabled={actionLoading === 'cycle'}
              className="btn-luxury flex items-center gap-2.5 disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${actionLoading === 'cycle' ? 'animate-spin' : ''}`} />
              HUNT NOW
            </button>

            {!isRunning ? (
              <button onClick={startEngine} className="btn-luxury btn-teal flex items-center gap-2.5">
                <Play className="w-3.5 h-3.5" /> AUTO HUNT
              </button>
            ) : (
              <button onClick={stopEngine} className="btn-luxury flex items-center gap-2.5" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                <Square className="w-3.5 h-3.5" /> STOP
              </button>
            )}

            <StatusBadge
              label={isRunning ? 'Running' : 'Standby'}
              active={isRunning}
              icon={<Zap className="w-3 h-3" />}
            />
            <div className="ml-auto text-[10px] font-mono text-dim">
              {data?.status.totalCycles || 0} cycles · {data?.status.uptime || '0h 0m'}
            </div>
          </motion.div>

          {/* Urgency strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-wrap gap-3"
          >
            {[
              { text: `${data?.prospects.total || 0} real prospects discovered`, accent: 'gold' as const },
              { text: `${data?.outreach.emailsSent || 0} emails sent · ${data?.outreach.queued || 0} queued`, accent: 'violet' as const },
              { text: `$${pipeline.toLocaleString()} pipeline value`, accent: 'teal' as const },
            ].map((u, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-semibold uppercase tracking-wider ${
                  u.accent === 'gold' ? 'border-gold/15 bg-gold/5 text-gold' :
                  u.accent === 'violet' ? 'border-violet/15 bg-violet/5 text-violet-bright' :
                  'border-teal/15 bg-teal/5 text-teal'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full pulse-dot ${
                  u.accent === 'gold' ? 'bg-gold' : u.accent === 'violet' ? 'bg-violet' : 'bg-teal'
                }`} />
                {u.text}
              </div>
            ))}
          </motion.div>
        </motion.header>

        {/* ═══ METRICS ═══ */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <LuxuryMetric label="Real Prospects" value={data?.prospects.total || 0} icon={<Users className="w-4 h-4" />} accent="gold" delay={0.1} />
          <LuxuryMetric label="Emails Sent" value={data?.outreach.emailsSent || 0} icon={<Mail className="w-4 h-4" />} accent="violet" delay={0.2} />
          <LuxuryMetric label="Pipeline Value" value={pipeline} prefix="$" icon={<DollarSign className="w-4 h-4" />} accent="teal" delay={0.3} />
          <LuxuryMetric label="Revenue Closed" value={data?.deliveries.totalRevenue || 0} prefix="$" icon={<TrendingUp className="w-4 h-4" />} accent="copper" delay={0.4} />
        </motion.div>

        {/* ═══ MAIN PANELS ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-8">
          {/* Prospects Panel — wider */}
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <LuxuryCard glow="gold" delay={0.2}>
              <SectionHeader
                title="Prospect Pipeline"
                subtitle="Real people found across the web"
                icon={<Target className="w-4 h-4" />}
              />
              <div className="space-y-2 max-h-96 overflow-y-auto panel-scroll">
                <AnimatePresence>
                  {(data?.prospects.topProspects || []).map((p, i) => (
                    <motion.div
                      key={p.name + i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-gold/20 hover:bg-gold/[0.02] transition-all duration-500 group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold text-xs font-bold">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-warm">{p.name}</p>
                            <p className="text-[10px] text-dim">{p.industry} · {p.source}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2.5 py-1 rounded-lg bg-gold/10 text-gold-bright font-bold">
                            {p.score}%
                          </span>
                          <span className="text-sm font-bold text-teal font-mono">
                            ${p.estimatedValue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {p.painPoints.length > 0 && (
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {p.painPoints.slice(0, 3).map(pp => (
                            <span key={pp} className="text-[9px] px-2 py-0.5 rounded-md bg-violet/10 text-violet-bright font-medium">
                              {pp}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {(!data?.prospects.topProspects || data.prospects.topProspects.length === 0) && (
                  <div className="text-center py-12">
                    <Target className="w-10 h-10 text-dim mx-auto mb-3 opacity-30" />
                    <p className="text-sm text-dim">No prospects yet</p>
                    <p className="text-[10px] text-dim/50 mt-1">Click HUNT NOW to start finding real people</p>
                  </div>
                )}
              </div>
            </LuxuryCard>
          </motion.div>

          {/* Outreach Panel — narrower */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <LuxuryCard glow="violet" delay={0.3}>
              <SectionHeader
                title="Outreach Log"
                subtitle="Emails generated and sent"
                icon={<Mail className="w-4 h-4" />}
              />
              <div className="space-y-2 max-h-96 overflow-y-auto panel-scroll">
                <AnimatePresence>
                  {(data?.outreach.recentEmails || []).map((e, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-violet/20 transition-all duration-500"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-warm truncate max-w-[60%]">{e.to}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                          e.status === 'sent'
                            ? 'bg-teal/10 text-teal'
                            : 'bg-gold/10 text-gold'
                        }`}>
                          {e.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted truncate">{e.subject}</p>
                      <p className="text-[9px] text-dim mt-1">{e.service}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {(!data?.outreach.recentEmails || data.outreach.recentEmails.length === 0) && (
                  <div className="text-center py-12">
                    <Mail className="w-10 h-10 text-dim mx-auto mb-3 opacity-30" />
                    <p className="text-sm text-dim">No outreach yet</p>
                    <p className="text-[10px] text-dim/50 mt-1">Engine will generate personalized emails after hunting</p>
                  </div>
                )}
              </div>
            </LuxuryCard>
          </motion.div>
        </div>

        {/* ═══ PROGRESS & DELIVERIES ═══ */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          <LuxuryCard delay={0.4}>
            <SectionHeader title="Hunt Funnel" icon={<Target className="w-4 h-4" />} />
            <div className="space-y-4">
              <LuxuryProgress label="Discovered" value={data?.prospects.found || 0} max={100} accent="gold" delay={0.5} />
              <LuxuryProgress label="Contacted" value={data?.prospects.contacted || 0} max={100} accent="violet" delay={0.6} />
              <LuxuryProgress label="Replied" value={data?.prospects.replied || 0} max={100} accent="teal" delay={0.7} />
              <LuxuryProgress label="Closed" value={data?.prospects.closed || 0} max={100} accent="gold" delay={0.8} />
            </div>
          </LuxuryCard>

          <LuxuryCard delay={0.5}>
            <SectionHeader title="Deliveries" icon={<Shield className="w-4 h-4" />} />
            <div className="space-y-3">
              {[
                { label: 'Pending', value: data?.deliveries.pending || 0, accent: 'gold' as const },
                { label: 'In Progress', value: data?.deliveries.inProgress || 0, accent: 'violet' as const },
                { label: 'Delivered', value: data?.deliveries.delivered || 0, accent: 'teal' as const },
              ].map((d) => (
                <div key={d.label} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                  <span className="text-xs text-muted">{d.label}</span>
                  <span className={`text-lg font-display font-bold ${
                    d.accent === 'gold' ? 'text-gold-bright' : d.accent === 'violet' ? 'text-violet-bright' : 'text-teal'
                  }`}>
                    <AnimatedCounter value={d.value} />
                  </span>
                </div>
              ))}
            </div>
          </LuxuryCard>

          <LuxuryCard delay={0.6}>
            <SectionHeader title="Revenue Streams" icon={<DollarSign className="w-4 h-4" />} />
            <div className="space-y-3">
              {[
                { name: 'Consulting', pct: 35, value: '$5,250' },
                { name: 'Digital Products', pct: 25, value: '$3,750' },
                { name: 'Affiliate', pct: 20, value: '$3,000' },
                { name: 'Membership', pct: 15, value: '$2,250' },
                { name: 'Coaching', pct: 5, value: '$750' },
              ].map((r, i) => (
                <div key={r.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-muted">{r.name}</span>
                    <span className="text-[11px] font-bold text-warm font-mono">{r.value}</span>
                  </div>
                  <LuxuryProgress
                    value={r.pct}
                    accent={i === 0 ? 'gold' : i === 1 ? 'violet' : i === 2 ? 'teal' : 'gold'}
                    height={3}
                    delay={0.7 + i * 0.1}
                  />
                </div>
              ))}
            </div>
          </LuxuryCard>
        </motion.div>

        {/* ═══ ACTIVATION GUIDE ═══ */}
        <motion.div variants={fadeUp}>
          <LuxuryCard glow="gold" delay={0.7}>
            <SectionHeader
              title="Activate Full Autonomy"
              subtitle="Add API keys to unlock real money mode"
              icon={<Zap className="w-4 h-4" />}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
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

        {/* ═══ FOOTER ═══ */}
        <motion.footer
          variants={fadeUp}
          className="mt-8 py-6 text-center"
        >
          <div className="luxury-divider mb-6" />
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className={`w-2 h-2 rounded-full pulse-dot ${isRunning ? 'bg-gold-bright' : 'bg-dim'}`} />
            <p className="text-xs font-display font-bold uppercase tracking-[0.2em] text-gold">
              {isRunning ? 'Engine Active' : 'Engine On Standby'}
            </p>
            <div className={`w-2 h-2 rounded-full pulse-dot ${isRunning ? 'bg-gold-bright' : 'bg-dim'}`} />
          </div>
          <p className="text-[10px] text-dim font-mono">
            {data?.prospects.total || 0} prospects · {data?.outreach.emailsSent || 0} emails · {data?.status.totalCycles || 0} cycles
          </p>
          <p className="text-[9px] text-dim/40 mt-2 font-display italic">PulseRevenue — AI Revenue Engine</p>
        </motion.footer>
      </motion.main>
    </>
  );
}
