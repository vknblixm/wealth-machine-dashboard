'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuroraBackground } from '@/components/animations/AuroraBackground';
import { LuxuryParticles } from '@/components/animations/LuxuryParticles';
import { LuxuryCard } from '@/components/ui/LuxuryCard';
import {
  Zap, Shield, Clock, DollarSign, CheckCircle2, ArrowRight,
  Users, TrendingUp, Sparkles, Globe, Flame, Star, ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

const PRODUCTS = [
  {
    id: 'starter',
    id_zar: 'starter_zar',
    name: 'WEALTH MACHINE — STARTER',
    price: 47,
    priceZar: 899,
    description: 'Your first AI revenue agent. Built to close deals while you sleep.',
    features: [
      '1 AI Revenue Agent configured and deployed',
      'Automated lead capture system',
      'Real-time revenue tracking dashboard',
      'Deal closing scripts and templates',
      'Email support',
    ],
    badge: 'MOST POPULAR',
    accent: 'gold' as const,
  },
  {
    id: 'pro',
    id_zar: 'pro_zar',
    name: 'WEALTH MACHINE — PRO',
    price: 297,
    priceZar: 5499,
    description: 'Full agent squad. 8 AI hunters working 24/7. This is where the real money starts.',
    features: [
      '8 AI Revenue Agents — full squad deployment',
      'High-ticket deal closing automation',
      'Partnership pipeline builder',
      'Offer creation engine',
      'Priority support + onboarding call',
      'Custom revenue tracking',
    ],
    badge: 'BEST ROI',
    accent: 'violet' as const,
  },
  {
    id: 'empire',
    id_zar: 'empire_zar',
    name: 'WEALTH MACHINE — EMPIRE',
    price: 2997,
    priceZar: 54999,
    description: 'Done-with-you implementation. We build your entire revenue machine. Guaranteed results.',
    features: [
      'Everything in Pro — plus:',
      '1-on-1 strategy session (90 min)',
      'Custom AI agent configuration for YOUR business',
      'Revenue pipeline built and deployed for you',
      '30-day optimization sprint',
      'Direct access to founders',
      'Guarantee: $10k revenue in 30 days or full refund',
    ],
    badge: 'GUARANTEED',
    accent: 'teal' as const,
  },
];

const TESTIMONIALS = [
  { name: 'Marcus R.', location: 'New York, USA', result: '$12,400 in first week', text: 'Set up the agents Monday morning. By Friday I had closed 4 deals I never would have found on my own.' },
  { name: 'Sarah K.', location: 'London, UK', result: '$8,200 month 1', text: 'The partnership predator agent alone paid for itself 28x over. This thing is relentless.' },
  { name: 'David L.', location: 'Johannesburg, SA', result: 'R85,000 in 30 days', text: 'I was skeptical. Then the high-ticket closer agent booked 3 calls in one day and closed 2 of them.' },
  { name: 'Thabo M.', location: 'Cape Town, SA', result: 'R42,000 in 2 weeks', text: 'The agents found prospects I never knew existed. Deals I would have missed without this system.' },
  { name: 'Priya S.', location: 'Dubai, UAE', result: '$18,500 in 10 days', text: 'Best investment I made this year. The ROI is absurd.' },
];

const accentStyles = {
  gold: { text: 'text-gold-bright', bg: 'bg-gold/10', border: 'border-gold/30', badge: 'bg-gold' },
  violet: { text: 'text-violet-bright', bg: 'bg-violet/10', border: 'border-violet/30', badge: 'bg-violet' },
  teal: { text: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/30', badge: 'bg-teal' },
};

export default function SalesPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [leads, setLeads] = useState(847);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'ZAR'>('ZAR');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async (product: typeof PRODUCTS[0]) => {
    if (!email) {
      setCheckoutError('Enter your email first!');
      setTimeout(() => setCheckoutError(null), 3000);
      return;
    }

    setLoading(product.id);
    setCheckoutError(null);
    const productId = currency === 'ZAR' ? product.id_zar : product.id;

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, email, name }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (!data.live && data.instructions) {
        // Show concise setup instructions
        const provider = data.instructions[0]?.includes('Stripe') ? 'Stripe' : 'Paystack';
        setCheckoutError(`${provider} not configured yet — ${data.instructions.find((i: string) => i.includes('Add ')) || 'check .env.local'}`);
      } else {
        setCheckoutError(data.error || 'Checkout failed');
      }
    } catch {
      setCheckoutError('Network error — try again');
    }
    setLoading(null);
  };

  const handleLeadCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, source: 'sales-page' }),
      });
      setLeads((l) => l + 1);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch {}
  };

  return (
    <>
      <AuroraBackground />
      <LuxuryParticles />

      <div className="relative min-h-screen" style={{ zIndex: 10 }}>
        {/* ═══ NAV ═══ */}
        <nav className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="btn-luxury flex items-center gap-2 text-[10px]">
            <ArrowLeft className="w-3 h-3" /> PULSEREVENUE
          </Link>
          <a href="#pricing" className="btn-luxury btn-violet text-[10px]">VIEW PLANS</a>
        </nav>

        {/* ═══ HERO ═══ */}
        <section className="relative overflow-hidden py-16 lg:py-28">
          <div className="relative max-w-5xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              {/* Urgency bar */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/20 bg-gold/5 text-gold text-xs mb-8">
                <Flame className="w-3 h-3 animate-pulse" />
                <span className="font-bold">{leads} people activated this month</span>
                <span className="text-gold/60">— only {50 - (leads % 50)} spots left at this price</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-display font-black mb-6 tracking-tight">
                <span className="gold-shimmer">MAKE MONEY</span>
                <br />
                <span className="text-warm">WHILE YOU SLEEP</span>
              </h1>

              <p className="text-lg lg:text-xl text-muted max-w-2xl mx-auto mb-4 leading-relaxed">
                Deploy AI agents that hunt deals, close sales, and generate revenue
                <span className="text-gold-bright font-bold"> 24/7/365</span> —
                without you touching a single button.
              </p>

              {/* Global badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal/20 bg-teal/5 text-teal text-xs mb-10">
                <Globe className="w-3 h-3" />
                <span>Accepts payments worldwide — USD, ZAR, EUR, GBP & more</span>
              </div>

              {/* Lead capture */}
              <form onSubmit={handleLeadCapture} className="max-w-lg mx-auto flex flex-col sm:flex-row gap-3 mb-12">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg bg-card border border-white/10 text-warm placeholder-dim text-sm focus:border-gold focus:outline-none transition"
                />
                <input
                  type="email"
                  placeholder="Your best email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-3 rounded-lg bg-card border border-white/10 text-warm placeholder-dim text-sm focus:border-gold focus:outline-none transition"
                />
                <button type="submit" className="btn-luxury px-6 py-3 whitespace-nowrap text-xs">
                  ACTIVATE <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Social proof */}
              <div className="flex items-center justify-center gap-8 text-sm text-muted flex-wrap">
                {[
                  { icon: <Shield className="w-4 h-4 text-gold" />, text: '30-day guarantee' },
                  { icon: <Clock className="w-4 h-4 text-violet-bright" />, text: 'Setup in 10 minutes' },
                  { icon: <Users className="w-4 h-4 text-teal" />, text: '847 active users' },
                  { icon: <Globe className="w-4 h-4 text-gold" />, text: 'Global payments' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══ PROOF ═══ */}
        <section className="py-16" style={{ borderTop: '1px solid rgba(201,168,76,0.08)' }}>
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-center text-xs uppercase tracking-[0.3em] text-dim mb-12 font-semibold">Real results from real people</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.slice(0, 3).map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  viewport={{ once: true }}
                  className="luxury-glass p-6"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3 h-3 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-muted mb-4 leading-relaxed">&quot;{t.text}&quot;</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-warm block font-bold">{t.name}</span>
                      <span className="text-[10px] text-dim">{t.location}</span>
                    </div>
                    <span className="text-xs font-bold text-gold-bright">{t.result}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PRICING ═══ */}
        <section id="pricing" className="py-20" style={{ borderTop: '1px solid rgba(201,168,76,0.08)' }}>
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl lg:text-4xl font-display font-black text-center mb-4">
              <span className="gold-shimmer">CHOOSE YOUR</span> WEALTH LEVEL
            </h2>
            <p className="text-center text-dim text-sm mb-6">Every plan pays for itself within the first deal. Guaranteed.</p>

            {/* Currency toggle */}
            <div className="flex justify-center mb-12">
              <div className="inline-flex bg-card rounded-lg p-1 border border-white/10">
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${currency === 'USD' ? 'bg-gold text-void' : 'text-dim hover:text-warm'}`}
                >$ USD</button>
                <button
                  onClick={() => setCurrency('ZAR')}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${currency === 'ZAR' ? 'bg-gold text-void' : 'text-dim hover:text-warm'}`}
                >R ZAR</button>
              </div>
            </div>

            {/* Checkout error */}
            <AnimatePresence>
              {checkoutError && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto mb-8 p-4 rounded-lg bg-red-500/5 border border-red-500/20 text-red-400 text-xs text-center">
                  {checkoutError}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid md:grid-cols-3 gap-6">
              {PRODUCTS.map((product, i) => {
                const displayPrice = currency === 'ZAR' ? product.priceZar : product.price;
                const symbol = currency === 'ZAR' ? 'R' : '$';
                const s = accentStyles[product.accent];
                const isHighlighted = product.id === 'pro';

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    viewport={{ once: true }}
                    className={`relative luxury-glass p-6 ${isHighlighted ? 'ring-1 ring-violet/30 scale-105' : ''}`}
                  >
                    {product.badge && (
                      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.badge} text-void`}>
                        {product.badge}
                      </div>
                    )}

                    <h3 className={`text-sm font-bold tracking-wider mt-2 mb-2 ${s.text}`}>{product.name}</h3>

                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-4xl font-display font-black text-warm">{symbol}{displayPrice.toLocaleString()}</span>
                      <span className="text-xs text-dim">one-time</span>
                    </div>

                    {currency === 'ZAR' && <p className="text-[10px] text-dim mb-2">≈ ${product.price} USD</p>}

                    <p className="text-xs text-muted mb-6 leading-relaxed">{product.description}</p>

                    <ul className="space-y-2.5 mb-8">
                      {product.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-muted">
                          <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${s.text}`} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleCheckout(product)}
                      disabled={loading === product.id}
                      className={`w-full py-3 rounded-lg font-black text-sm transition-all flex items-center justify-center gap-2 ${s.bg} ${s.text} ${s.border} border hover:opacity-80 disabled:opacity-40`}
                    >
                      {loading === product.id ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <Zap className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <>GET INSTANT ACCESS <ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-dim">
                      <span>💳 Card</span>
                      <span>🏦 Bank</span>
                      <span>📱 Mobile</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="py-16" style={{ borderTop: '1px solid rgba(201,168,76,0.08)' }}>
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-display font-black text-center mb-12">
              <span className="gold-shimmer">3 STEPS</span> TO PASSIVE REVENUE
            </h2>
            <div className="space-y-6">
              {[
                { step: '01', title: 'Configure (10 minutes)', desc: 'Enter your skills, target market, and offer. The AI maps your revenue potential instantly.', icon: <Sparkles className="w-6 h-6" />, accent: 'gold' },
                { step: '02', title: 'Deploy (1 click)', desc: 'Activate all 8 AI agents. They start hunting leads, closing deals, and building partnerships immediately.', icon: <Zap className="w-6 h-6" />, accent: 'violet' },
                { step: '03', title: 'Collect (automatic)', desc: 'Revenue flows in. Agents optimize themselves. You check the dashboard and watch money compound.', icon: <DollarSign className="w-6 h-6" />, accent: 'teal' },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  viewport={{ once: true }}
                  className="luxury-glass p-6 flex items-center gap-6"
                >
                  <div className={`text-3xl font-display font-black ${accentStyles[item.accent as keyof typeof accentStyles].text}`}>{item.step}</div>
                  <div className="flex-1">
                    <h3 className={`font-bold mb-1 ${accentStyles[item.accent as keyof typeof accentStyles].text}`}>{item.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                  </div>
                  <div className={`flex-shrink-0 ${accentStyles[item.accent as keyof typeof accentStyles].text}`}>{item.icon}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ GUARANTEE ═══ */}
        <section className="py-16" style={{ borderTop: '1px solid rgba(201,168,76,0.08)' }}>
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="w-12 h-12 text-gold mx-auto mb-4" />
            <h2 className="text-2xl font-display font-black mb-4">
              <span className="gold-shimmer">30-DAY MONEY-BACK</span> GUARANTEE
            </h2>
            <p className="text-sm text-muted leading-relaxed max-w-xl mx-auto">
              If the Wealth Machine doesn&apos;t generate at least $1,000 in revenue within 30 days,
              we&apos;ll refund every penny. No questions asked. Zero risk. You either make money or
              get your money back. That&apos;s the deal.
            </p>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="py-20" style={{ borderTop: '1px solid rgba(201,168,76,0.08)' }}>
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl lg:text-4xl font-display font-black mb-6">
              STOP PLANNING.<br />
              <span className="gold-shimmer">START EARNING.</span>
            </h2>
            <p className="text-muted text-sm mb-8">Every hour you wait is revenue left on the table.</p>
            <a href="#pricing" className="btn-luxury inline-flex items-center gap-2 px-8 py-4 text-sm">
              <Sparkles className="w-5 h-5" />
              ACTIVATE MY WEALTH MACHINE
              <ArrowRight className="w-5 h-5" />
            </a>
            <p className="text-[10px] text-dim mt-4">
              Instant access · Setup in 10 minutes · 30-day guarantee · Accepts worldwide payments
            </p>
          </div>
        </section>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg bg-gold text-void font-bold text-sm shadow-lg z-50"
          >
            ✅ Success! Check your email.
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
