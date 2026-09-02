'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FloatingMoney } from '@/components/animations/FloatingMoney';
import { MoneyFlowCanvas } from '@/components/animations/MoneyFlowCanvas';
import { NeuralNetwork } from '@/components/animations/NeuralNetwork';
import { UrgencyPulse } from '@/components/ui/UrgencyPulse';
import { PulseGlow } from '@/components/animations/PulseGlow';
import { containerVariants, itemVariants } from '@/lib/animations';
import { formatCurrency } from '@/lib/revenue-tracker';
import { Zap, TrendingUp, DollarSign, Flame, ExternalLink, Mail, Users, RefreshCw, Play, Square } from 'lucide-react';
import Link from 'next/link';

interface EngineData {
  status: { isRunning: boolean; lastHunt: string | null; totalCycles: number; uptime: string; errors: string[] };
  prospects: { total: number; found: number; contacted: number; replied: number; closed: number;
    topProspects: Array<{ name: string; industry: string; painPoints: string[]; score: number; estimatedValue: number; source: string }> };
  outreach: { totalSent: number; emailsSent: number; queued: number;
    recentEmails: Array<{ to: string; subject: string; service: string; status: string; sentAt: string }> };
  deliveries: { totalDeliveries: number; totalRevenue: number; pending: number; inProgress: number; delivered: number };
}

export default function HomePage() {
  const [data, setData] = useState<EngineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStatus = async () => {
    try { const r = await fetch('/api/engine'); const j = await r.json(); setData(j); setLoading(false); }
    catch { setLoading(false); }
  };
  const triggerCycle = async () => { setActionLoading('cycle'); try { await fetch('/api/engine', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }); await fetchStatus(); } catch {} setActionLoading(null); };
  const startEngine = async () => { setActionLoading('start'); await fetch('/api/engine', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'start', intervalMs: 300000 }) }); await fetchStatus(); setActionLoading(null); };
  const stopEngine = async () => { setActionLoading('stop'); await fetch('/api/engine', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'stop' }) }); await fetchStatus(); setActionLoading(null); };

  useEffect(() => { fetchStatus(); const i = setInterval(fetchStatus, 8000); return () => clearInterval(i); }, []);

  if (loading) return (<div className='min-h-screen flex items-center justify-center' style={{ background: '#0a0e27' }}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}><Zap className='w-12 h-12 text-neon-green' /></motion.div></div>);

  const pipeline = (data?.prospects.topProspects || []).reduce((s, p) => s + p.estimatedValue, 0);

  return (<>
    <MoneyFlowCanvas /><NeuralNetwork />
    <motion.main variants={containerVariants} initial='hidden' animate='visible' className='relative min-h-screen p-4 lg:p-6 xl:p-8' style={{ zIndex: 2 }}>
      <motion.header variants={itemVariants} className='mb-6 lg:mb-8'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5'>
          <div>
            <div className='flex items-center gap-3 mb-1'>
              <motion.h1 className='text-3xl lg:text-5xl font-black text-neon-green tracking-tight' style={{ textShadow: '0 0 20px rgba(0,255,65,0.4)' }} animate={{ textShadow: ['0 0 20px rgba(0,255,65,0.4)', '0 0 30px rgba(0,255,65,0.6)', '0 0 20px rgba(0,255,65,0.4)'] }} transition={{ duration: 3, repeat: Infinity }}>WEALTH MACHINE</motion.h1>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}><Flame className='w-6 h-6 lg:w-8 lg:h-8 text-neon-red' /></motion.div>
            </div>
            <p className='text-neon-blue/80 text-[10px] lg:text-xs uppercase tracking-[0.3em]'>Real Revenue Engine</p>
          </div>
          <div className='flex items-center gap-3'>
            <Link href='/ops' className='px-3 py-1.5 rounded-lg bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-xs font-bold hover:bg-neon-blue/20 transition flex items-center gap-1.5'><Zap className='w-3 h-3' /> ENGINE <ExternalLink className='w-2.5 h-2.5' /></Link>
            <Link href='/sell' className='px-3 py-1.5 rounded-lg bg-neon-purple/10 border border-neon-purple/30 text-neon-purple text-xs font-bold hover:bg-neon-purple/20 transition flex items-center gap-1.5'>SELL <ExternalLink className='w-2.5 h-2.5' /></Link>
          </div>
        </div>
        <div className='flex gap-2 mb-4 flex-wrap'>
          <button onClick={triggerCycle} disabled={actionLoading === 'cycle'} className='flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neon-green text-dark-bg font-black text-xs hover:opacity-90 transition disabled:opacity-50'><RefreshCw className={'w-3 h-3 ' + (actionLoading === 'cycle' ? 'animate-spin' : '')} /> HUNT NOW</button>
          {!data?.status.isRunning ? (<button onClick={startEngine} className='flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/30 font-bold text-xs hover:bg-neon-blue/20 transition'><Play className='w-3 h-3' /> AUTO</button>)
           : (<button onClick={stopEngine} className='flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neon-red/10 text-neon-red border border-neon-red/30 font-bold text-xs hover:bg-neon-red/20 transition'><Square className='w-3 h-3' /> STOP</button>)}
          <div className={'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold ' + (data?.status.isRunning ? 'bg-neon-green/10 text-neon-green border border-neon-green/30' : 'bg-dark-card text-os-dim border border-os-dim/30')}>
            <div className={'w-2 h-2 rounded-full ' + (data?.status.isRunning ? 'bg-neon-green animate-pulse' : 'bg-os-dim')} />
            {data?.status.isRunning ? 'RUNNING' : 'STOPPED'} - {data?.status.totalCycles || 0} cycles
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
          <UrgencyPulse message={(data?.prospects.total || 0) + ' real prospects found'} severity='high' />
          <UrgencyPulse message={(data?.outreach.emailsSent || 0) + ' emails sent / ' + (data?.outreach.queued || 0) + ' queued'} severity='medium' />
          <UrgencyPulse message={'$' + pipeline.toLocaleString() + ' pipeline value'} severity='low' />
        </div>
      </motion.header>

      <motion.div variants={itemVariants} className='grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6'>
        {[{ l: 'Real Prospects', v: String(data?.prospects.total || 0), c: 'text-neon-green', i: <Users className='w-4 h-4' /> },
          { l: 'Emails Sent', v: String(data?.outreach.emailsSent || 0), c: 'text-neon-blue', i: <Mail className='w-4 h-4' /> },
          { l: 'Pipeline', v: '$' + pipeline.toLocaleString(), c: 'text-neon-purple', i: <DollarSign className='w-4 h-4' /> },
          { l: 'Closed', v: '$' + (data?.deliveries.totalRevenue || 0).toLocaleString(), c: 'text-neon-red', i: <TrendingUp className='w-4 h-4' /> }
        ].map(m => (<div key={m.l} className='glass-card p-4 rounded-xl border border-white/5'><div className='flex items-center justify-between mb-1'><p className='text-[9px] uppercase tracking-widest text-os-dim'>{m.l}</p><span className={m.c}>{m.i}</span></div><p className={'text-2xl font-black ' + m.c}>{m.v}</p></div>))}
      </motion.div>

      <motion.div variants={itemVariants} className='grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6'>
        <div className='glass-card p-5 rounded-xl border border-neon-green/10'>
          <h2 className='text-sm font-bold text-neon-green mb-4'>REAL PROSPECTS</h2>
          <div className='space-y-2 max-h-80 overflow-y-auto'>
            {(data?.prospects.topProspects || []).map((p, i) => (
              <div key={p.name + i} className='p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:border-neon-green/20 transition'>
                <div className='flex items-center justify-between mb-1'><span className='text-xs font-bold'>{p.name}</span><span className='text-[10px] px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green'>Score: {p.score}</span></div>
                <div className='flex items-center justify-between'><span className='text-[10px] text-os-dim'>{p.industry} / {p.source}</span><span className='text-[10px] font-bold text-neon-blue'>$' + '{p.estimatedValue.toLocaleString()}' + '</span></div>
                {p.painPoints.length > 0 && <div className='flex gap-1 mt-1.5 flex-wrap'>{p.painPoints.slice(0, 3).map(pp => <span key={pp} className='text-[8px] px-1.5 py-0.5 rounded bg-neon-purple/10 text-neon-purple'>{pp}</span>)}</div>}
              </div>))}
            {(!data?.prospects.topProspects || data.prospects.topProspects.length === 0) && <p className='text-xs text-os-dim text-center py-8'>No prospects yet. Click HUNT NOW.</p>}
          </div>
        </div>
        <div className='glass-card p-5 rounded-xl border border-neon-blue/10'>
          <h2 className='text-sm font-bold text-neon-blue mb-4'>RECENT OUTREACH</h2>
          <div className='space-y-2 max-h-80 overflow-y-auto'>
            {(data?.outreach.recentEmails || []).map((e, i) => (
              <div key={i} className='p-3 rounded-lg border border-white/5 bg-white/[0.02]'>
                <div className='flex items-center justify-between mb-1'><span className='text-xs font-bold'>{e.to}</span><span className={'text-[10px] px-2 py-0.5 rounded-full ' + (e.status === 'sent' ? 'bg-neon-green/10 text-neon-green' : 'bg-yellow-500/10 text-yellow-400')}>{e.status}</span></div>
                <p className='text-[10px] text-os-dim truncate'>{e.subject}</p>
                <p className='text-[9px] text-os-dim/50 mt-0.5'>{e.service}</p>
              </div>))}
            {(!data?.outreach.recentEmails || data.outreach.recentEmails.length === 0) && <p className='text-xs text-os-dim text-center py-8'>No outreach yet.</p>}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className='glass-card p-5 rounded-xl border border-neon-green/10'>
        <h2 className='text-sm font-bold text-neon-green mb-3'>ACTIVATE FULL AUTONOMY</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-os-dim'>
          <div className='space-y-2'><p><code className='text-neon-blue'>RESEND_API_KEY</code> - emails actually get sent</p><p><code className='text-neon-blue'>STRIPE_SECRET_KEY</code> - payments actually process</p><p><code className='text-neon-blue'>GOOGLE_API_KEY</code> - prospects found via Google</p></div>
          <div className='space-y-2'><p>Click HUNT NOW - engine finds real people</p><p>Click AUTO - engine runs every 5 min</p><p>Add API keys - emails send, payments process, revenue flows</p></div>
        </div>
      </motion.div>

      <motion.footer variants={itemVariants} className='mt-6 glass-card p-4 rounded-xl border border-neon-green/10 text-center'>
        <div className='flex items-center justify-center gap-2 mb-2'><PulseGlow color='green' size='sm' /><p className='text-xs font-bold text-neon-green uppercase tracking-widest'>{data?.status.isRunning ? 'ENGINE RUNNING' : 'ENGINE READY'}</p><PulseGlow color='green' size='sm' /></div>
        <p className='text-[9px] text-os-dim'>{data?.prospects.total || 0} prospects - {data?.outreach.emailsSent || 0} emails - {data?.status.totalCycles || 0} cycles - {data?.status.uptime || '0h 0m'} uptime</p>
      </motion.footer>
    </motion.main>
    <FloatingMoney />
  </>);
}
