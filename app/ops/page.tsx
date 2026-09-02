'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Play, Square, RefreshCw, Mail, Users, Package,
  DollarSign, ArrowRight, CheckCircle, Clock, AlertTriangle,
} from 'lucide-react';

interface EngineData {
  status: {
    isRunning: boolean;
    lastHunt: string | null;
    lastOutreach: string | null;
    lastDeliveryCheck: string | null;
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

export default function OpsPage() {
  const [data, setData] = useState<EngineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/engine');
      const json = await res.json();
      setData(json);
      setLoading(false);
    } catch (e) {
      console.error('Failed to fetch engine status:', e);
    }
  };

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
        `Cycle #${result.status.totalCycles} complete — ${result.hunt.found} prospects found, ${result.outreach.sent} emails sent`,
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
    setLogs((prev) => ['🚀 Engine started — running every 5 minutes', ...prev]);
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
    setLogs((prev) => ['⏹️ Engine stopped', ...prev]);
    await fetchStatus();
    setActionLoading(null);
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center font-mono">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
          <Zap className="w-8 h-8 text-[#00ff41]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white font-mono p-6 lg:p-8" style={{
      backgroundImage: 'linear-gradient(rgba(0,255,65,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.02) 1px, transparent 1px)',
      backgroundSize: '60px 60px',
    }}>
      {/* ═══ HEADER ═══ */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-[#00ff41]" style={{ textShadow: '0 0 20px rgba(0,255,65,0.4)' }}>
              REVENUE ENGINE
            </h1>
            <p className="text-xs text-gray-500 mt-1">Autonomous money machine — real activity, no simulation</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${
              data?.status.isRunning
                ? 'bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30'
                : 'bg-gray-800 text-gray-400 border border-gray-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${data?.status.isRunning ? 'bg-[#00ff41] animate-pulse' : 'bg-gray-600'}`} />
              {data?.status.isRunning ? 'RUNNING' : 'STOPPED'}
            </div>
          </div>
        </div>

        {/* ═══ CONTROLS ═══ */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={triggerCycle}
            disabled={actionLoading === 'cycle'}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00ff41] text-[#0a0e27] font-black text-sm hover:bg-[#00dd33] transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${actionLoading === 'cycle' ? 'animate-spin' : ''}`} />
            RUN CYCLE NOW
          </button>
          {!data?.status.isRunning ? (
            <button
              onClick={startEngine}
              disabled={actionLoading === 'start'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00d9ff]/10 text-[#00d9ff] border border-[#00d9ff]/30 font-bold text-sm hover:bg-[#00d9ff]/20 transition"
            >
              <Play className="w-4 h-4" />
              START AUTOMATIC
            </button>
          ) : (
            <button
              onClick={stopEngine}
              disabled={actionLoading === 'stop'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 font-bold text-sm hover:bg-red-500/20 transition"
            >
              <Square className="w-4 h-4" />
              STOP
            </button>
          )}
        </div>

        {/* ═══ METRICS ═══ */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Prospects Found', value: data?.prospects.total || 0, icon: <Users className="w-4 h-4" />, color: '#00ff41' },
            { label: 'Emails Sent', value: data?.outreach.emailsSent || 0, icon: <Mail className="w-4 h-4" />, color: '#00d9ff' },
            { label: 'Pipeline Value', value: `$${((data?.prospects.topProspects || []).reduce((s, p) => s + p.estimatedValue, 0)).toLocaleString()}`, icon: <DollarSign className="w-4 h-4" />, color: '#9d4edd' },
            { label: 'Deliveries', value: data?.deliveries.totalDeliveries || 0, icon: <Package className="w-4 h-4" />, color: '#ff006e' },
            { label: 'Engine Cycles', value: data?.status.totalCycles || 0, icon: <Zap className="w-4 h-4" />, color: '#00ff41' },
          ].map((m) => (
            <div key={m.label} className="p-4 rounded-xl border border-white/5 bg-[#1a1f3a]/50">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[9px] uppercase tracking-widest text-gray-500">{m.label}</p>
                <span style={{ color: m.color }}>{m.icon}</span>
              </div>
              <p className="text-2xl font-black" style={{ color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* ═══ TWO COLUMN ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* PROSPECTS */}
          <div className="p-5 rounded-xl border border-[#00ff41]/10 bg-[#1a1f3a]/30">
            <h2 className="text-sm font-bold text-[#00ff41] mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" /> TOP PROSPECTS
            </h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {(data?.prospects.topProspects || []).map((p, i) => (
                <motion.div
                  key={p.name + i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:border-[#00ff41]/20 transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{p.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00ff41]/10 text-[#00ff41]">
                      Score: {p.score}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">{p.industry} • {p.source}</span>
                    <span className="text-[10px] font-bold text-[#00d9ff]">${p.estimatedValue.toLocaleString()}</span>
                  </div>
                  {p.painPoints.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {p.painPoints.slice(0, 3).map((pp) => (
                        <span key={pp} className="text-[8px] px-1.5 py-0.5 rounded bg-[#9d4edd]/10 text-[#9d4edd]">
                          {pp}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
              {(!data?.prospects.topProspects || data.prospects.topProspects.length === 0) && (
                <p className="text-xs text-gray-600 text-center py-8">
                  No prospects yet. Run a cycle to start hunting.
                </p>
              )}
            </div>
          </div>

          {/* RECENT OUTREACH */}
          <div className="p-5 rounded-xl border border-[#00d9ff]/10 bg-[#1a1f3a]/30">
            <h2 className="text-sm font-bold text-[#00d9ff] mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4" /> RECENT OUTREACH
            </h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {(data?.outreach.recentEmails || []).map((e, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-lg border border-white/5 bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{e.to}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      e.status === 'sent' ? 'bg-[#00ff41]/10 text-[#00ff41]' : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {e.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate">{e.subject}</p>
                  <p className="text-[9px] text-gray-600 mt-0.5">{e.service} • {new Date(e.sentAt).toLocaleTimeString()}</p>
                </motion.div>
              ))}
              {(!data?.outreach.recentEmails || data.outreach.recentEmails.length === 0) && (
                <p className="text-xs text-gray-600 text-center py-8">
                  No outreach yet. Run a cycle to start sending.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ═══ ACTIVITY LOG ═══ */}
        <div className="p-5 rounded-xl border border-white/5 bg-[#1a1f3a]/30">
          <h2 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> ACTIVITY LOG
          </h2>
          <div className="space-y-1 max-h-48 overflow-y-auto font-mono text-[11px]">
            {logs.length === 0 && (
              <p className="text-gray-600 text-center py-4">No activity yet. Click "RUN CYCLE NOW" to start.</p>
            )}
            <AnimatePresence>
              {logs.map((log, i) => (
                <motion.div
                  key={log + i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-gray-400"
                >
                  <span className="text-gray-600">{new Date().toLocaleTimeString()}</span> {log}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* ═══ ERRORS ═══ */}
        {data?.status.errors && data.status.errors.length > 0 && (
          <div className="mt-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
            <h3 className="text-xs font-bold text-red-400 flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3 h-3" /> ERRORS
            </h3>
            {data.status.errors.map((err, i) => (
              <p key={i} className="text-[10px] text-red-300/70">{err}</p>
            ))}
          </div>
        )}

        {/* ═══ SETUP GUIDE ═══ */}
        <div className="mt-8 p-5 rounded-xl border border-[#00ff41]/10 bg-[#1a1f3a]/30">
          <h2 className="text-sm font-bold text-[#00ff41] mb-3">⚡ ACTIVATE REAL MONEY MODE</h2>
          <div className="space-y-2 text-xs text-gray-400">
            <p>1. Add <code className="text-[#00d9ff]">RESEND_API_KEY</code> to <code className="text-[#00d9ff]">.env.local</code> — emails actually get sent</p>
            <p>2. Add <code className="text-[#00d9ff]">STRIPE_SECRET_KEY</code> — payments actually get processed</p>
            <p>3. Add <code className="text-[#00d9ff]">GOOGLE_API_KEY</code> + <code className="text-[#00d9ff]">GOOGLE_CX</code> — prospects get found via Google</p>
            <p>4. Click <strong className="text-white">START AUTOMATIC</strong> — the engine runs every 5 minutes</p>
            <p>5. Watch the real prospects, real emails, and real revenue flow in</p>
          </div>
        </div>
      </div>
    </div>
  );
}
