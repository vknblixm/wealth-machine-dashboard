label: 'Real Prospects', value: String(data?.prospects.total || 0), icon: <Users className='w-4 h-4' />, color: '#00ff41' },
          { label: 'Emails Sent', value: String(data?.outreach.emailsSent || 0), icon: <Mail className='w-4 h-4' />, color: '#00d9ff' },
          { label: 'Pipeline Value', value: pipeline.toLocaleString(), icon: <DollarSign className='w-4 h-4' />, color: '#9d4edd' },
          { label: 'Revenue Closed', value: (data?.deliveries.totalRevenue || 0).toLocaleString(), icon: <TrendingUp className='w-4 h-4' />, color: '#ff006e' },
        ].map((m) => (
          <div key={m.label} className='glass-card p-4 rounded-xl border border-white/5'>
            <div className='flex items-center justify-between mb-1'>
              <p className='text-[9px] uppercase tracking-widest text-os-dim'>{m.label}</p>
              <span style={{ color: m.color }}>{m.icon}</span>
            </div>
            <p className='text-2xl font-black' style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className='grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6 lg:mb-8'>
        <div className='glass-card p-5 rounded-xl border border-neon-green/10'>
          <h2 className='text-sm font-bold text-neon-green mb-4 flex items-center gap-2'><Users className='w-4 h-4' /> REAL PROSPECTS</h2>
          <div className='space-y-2 max-h-80 overflow-y-auto'>
            {(data?.prospects.topProspects || []).map((p, i) => (
              <div key={p.name + i} className='p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:border-neon-green/20 transition'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-xs font-bold'>{p.name}</span>
                  <span className='text-[10px] px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green'>Score: {p.score}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-[10px] text-os-dim'>{p.industry} / {p.source}</span>
                  <span className='text-[10px] font-bold text-neon-blue'>$VAL</span>
                </div>
                {p.painPoints.length > 0 && <div className='flex gap-1 mt-1.5 flex-wrap'>{p.painPoints.slice(0, 3).map((pp) => <span key={pp} className='text-[8px] px-1.5 py-0.5 rounded bg-neon-purple/10 text-neon-purple'>{pp}</span>)}</div>}
              </div>
            ))}
            {(!data?.prospects.topProspects || data.prospects.topProspects.length === 0) && <p className='text-xs text-os-dim text-center py-8'>No prospects yet. Click HUNT NOW.</p>}
          </div>
        </div>

        <div className='glass-card p-5 rounded-xl border border-neon-blue/10'>
          <h2 className='text-sm font-bold text-neon-blue mb-4 flex items-center gap-2'><Mail className='w-4 h-4' /> RECENT OUTREACH</h2>
          <div className='space-y-2 max-h-80 overflow-y-auto'>
            {(data?.outreach.recentEmails || []).map((e, i) => (
              <div key={i} className='p-3 rounded-lg border border-white/5 bg-white/[0.02]'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-xs font-bold'>{e.to}</span>
                  <span className={'text-[10px] px-2 py-0.5 rounded-full ' + (e.status === 'sent' ? 'bg-neon-green/10 text-neon-green' : 'bg-yellow-500/10 text-yellow-400')}>{e.status}</span>
                </div>
                <p className='text-[10px] text-os-dim truncate'>{e.subject}</p>
                <p className='text-[9px] text-os-dim/50 mt-0.5'>{e.service}</p>
              </div>
            ))}
            {(!data?.outreach.recentEmails || data.outreach.recentEmails.length === 0) && <p className='text-xs text-os-dim text-center py-8'>No outreach yet. Run a cycle.</p>}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className='glass-card p-5 rounded-xl border border-neon-green/10'>
        <h2 className='text-sm font-bold text-neon-green mb-3'>ACTIVATE FULL AUTONOMY</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-os-dim'>
          <div className='space-y-2'>
            <p><code className='text-neon-blue'>RESEND_API_KEY</code> - emails actually get sent</p>
            <p><code className='text-neon-blue'>STRIPE_SECRET_KEY</code> - payments actually process</p>
            <p><code className='text-neon-blue'>GOOGLE_API_KEY</code> - prospects found via Google</p>
          </div>
          <div className='space-y-2'>
            <p>Click HUNT NOW - engine finds real people</p>
            <p>Click AUTO - engine runs every 5 min</p>
            <p>Add API keys - emails send, payments process, revenue flows</p>
          </div>
        </div>
      </motion.div>

      <motion.footer variants={itemVariants} className='mt-6 glass-card p-4 rounded-xl border border-neon-green/10 text-center'>
        <div className='flex items-center justify-center gap-2 mb-2'>
          <PulseGlow color='green' size='sm' />
          <p className='text-xs font-bold text-neon-green uppercase tracking-widest'>
            {data?.status.isRunning ? 'ENGINE RUNNING' : 'ENGINE READY'}
          </p>
          <PulseGlow color='green' size='sm' />
        </div>
        <p className='text-[9px] text-os-dim'>
          {data?.prospects.total || 0} prospects - {data?.outreach.emailsSent || 0} emails - {data?.status.totalCycles || 0} cycles - {data?.status.uptime || '0h 0m'} uptime
        </p>
      </motion.footer>
    </motion.main>
    <FloatingMoney />
  </>
);
}
