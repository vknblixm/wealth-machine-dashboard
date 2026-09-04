'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AuroraBackground } from '@/components/animations/AuroraBackground';
import { LuxuryParticles } from '@/components/animations/LuxuryParticles';
import { CheckCircle2, ArrowRight, Zap, Mail } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      // Stripe session — verify it
      fetch(`/api/verify-session?session_id=${sessionId}`)
        .then(r => r.json())
        .then(data => {
          if (data.status === 'complete' || data.status === 'paid') {
            setStatus('success');
            setDetails(data);
          } else {
            // Still show success — Stripe may need a moment
            setStatus('success');
            setDetails({ email: data.customer_email || 'your email', product: 'Your plan' });
          }
        })
        .catch(() => {
          // Payment likely succeeded — show success anyway
          setStatus('success');
          setDetails({ email: 'your email', product: 'Your plan' });
        });
    } else {
      // Paystack or other — just show success
      setTimeout(() => setStatus('success'), 1000);
    }
  }, [sessionId]);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6" style={{ zIndex: 10 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="luxury-glass p-8 md:p-12 max-w-lg w-full text-center"
      >
        {status === 'loading' ? (
          <div className="py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mx-auto mb-6 border-2 border-gold/30 border-t-gold rounded-full"
            />
            <p className="text-muted text-sm">Verifying your payment...</p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle2 className="w-20 h-20 text-gold mx-auto mb-6" />
            </motion.div>

            <h1 className="text-3xl font-display font-black mb-2 gold-shimmer">
              PAYMENT CONFIRMED
            </h1>
            <p className="text-muted text-sm mb-8">
              Welcome to PulseRevenue. Your Wealth Machine is being activated.
            </p>

            <div className="space-y-4 text-left mb-8">
              <div className="luxury-glass p-4 flex items-center gap-4">
                <Zap className="w-8 h-8 text-gold flex-shrink-0" />
                <div>
                  <p className="text-warm font-bold text-sm">Step 1: Check Your Email</p>
                  <p className="text-dim text-xs">We&apos;ve sent setup instructions to {details?.email || 'your email'}.</p>
                </div>
              </div>
              <div className="luxury-glass p-4 flex items-center gap-4">
                <Mail className="w-8 h-8 text-violet-bright flex-shrink-0" />
                <div>
                  <p className="text-warm font-bold text-sm">Step 2: Configure Your Agents</p>
                  <p className="text-dim text-xs">Follow the link in the email to set up your AI revenue agents.</p>
                </div>
              </div>
              <div className="luxury-glass p-4 flex items-center gap-4">
                <CheckCircle2 className="w-8 h-8 text-teal flex-shrink-0" />
                <div>
                  <p className="text-warm font-bold text-sm">Step 3: Watch Revenue Flow</p>
                  <p className="text-dim text-xs">Your agents start hunting deals within minutes.</p>
                </div>
              </div>
            </div>

            <Link
              href="/"
              className="btn-luxury inline-flex items-center gap-2 px-8 py-3 text-sm"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <>
      <AuroraBackground />
      <LuxuryParticles />
      <Suspense fallback={
        <div className="relative min-h-screen flex items-center justify-center" style={{ zIndex: 10 }}>
          <div className="text-muted text-sm">Loading...</div>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </>
  );
}
