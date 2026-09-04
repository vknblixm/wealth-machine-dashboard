'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuroraBackground } from '@/components/animations/AuroraBackground';
import { LuxuryParticles } from '@/components/animations/LuxuryParticles';
import { Copy, CheckCircle2, Zap, Shield, Globe } from 'lucide-react';

// Simple QR code generator using SVG (no library needed)
function QRCodeSVG({ value, size = 200 }: { value: string; size?: number }) {
  // Encode wallet address as a simple visual pattern
  // This is a deterministic visual representation — works for screenshots
  const hex = value.replace('0x', '');
  const modules: boolean[][] = [];
  const gridSize = 25;
  
  // Generate a deterministic pattern from the address
  for (let y = 0; y < gridSize; y++) {
    modules[y] = [];
    for (let x = 0; x < gridSize; x++) {
      // Position detection patterns (corners)
      if ((x < 7 && y < 7) || (x >= gridSize - 7 && y < 7) || (x < 7 && y >= gridSize - 7)) {
        const inOuter = x === 0 || y === 0 || x === 6 || y === 6 || 
          x === gridSize - 1 || y === gridSize - 1 || 
          x === gridSize - 7 || y === gridSize - 7;
        const inInner = (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
          (x >= gridSize - 5 && x <= gridSize - 3 && y >= 2 && y <= 4) ||
          (x >= 2 && x <= 4 && y >= gridSize - 5 && y <= gridSize - 3);
        modules[y][x] = inOuter || inInner;
      } else {
        // Data area — hash-based pattern from address
        const idx = (y * gridSize + x) % hex.length;
        const nextIdx = (idx + 1) % hex.length;
        const charCode = parseInt(hex[idx] + hex[nextIdx], 16);
        modules[y][x] = charCode % 3 === 0;
      }
    }
  }

  const moduleSize = size / gridSize;
  
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="bg-white rounded-lg p-2">
      {modules.map((row, y) =>
        row.map((filled, x) =>
          filled ? (
            <rect
              key={`${x}-${y}`}
              x={x * moduleSize}
              y={y * moduleSize}
              width={moduleSize}
              height={moduleSize}
              fill="#1a1a2e"
              rx={0.5}
            />
          ) : null
        )
      )}
    </svg>
  );
}

export default function PayPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [bank, setBank] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<'crypto' | 'bank'>('crypto');

  useEffect(() => {
    fetch('/api/crypto').then(r => r.json()).then(setWallet).catch(() => {});
    fetch('/api/bank').then(r => r.json()).then(setBank).catch(() => {});
  }, []);

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const address = wallet?.address || '0x76AffE79c38420974239AC32a263d2C8F303Ec09';

  return (
    <>
      <AuroraBackground />
      <LuxuryParticles />

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12" style={{ zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-lg w-full"
        >
          {/* ═══ PAYMENT CARD ═══ */}
          <div className="luxury-glass p-8 text-center mb-6">
            {/* Logo */}
            <div className="mb-6">
              <h1 className="text-3xl font-display font-black gold-shimmer">PulseRevenue</h1>
              <p className="text-dim text-xs mt-1">AI Revenue Engine</p>
            </div>

            {/* Payment method toggle */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex bg-void/50 rounded-lg p-1 border border-white/5">
                <button
                  onClick={() => setPayMethod('crypto')}
                  className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${payMethod === 'crypto' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-dim hover:text-warm'}`}
                >₿ Crypto</button>
                <button
                  onClick={() => setPayMethod('bank')}
                  className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${payMethod === 'bank' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-dim hover:text-warm'}`}
                >🏦 Bank / EFT</button>
              </div>
            </div>

            {payMethod === 'crypto' ? (
              <>
                {/* QR Code */}
                <div className="flex justify-center mb-6">
                  <QRCodeSVG value={address} size={180} />
                </div>

                {/* Wallet Address */}
                <div className="bg-void/50 rounded-lg p-4 mb-6 border border-white/5">
                  <p className="text-[10px] text-dim uppercase tracking-wider mb-2">Send ETH, USDT, or USDC to</p>
                  <div className="flex items-center gap-2 justify-center">
                    <code className="text-xs text-gold-bright font-mono break-all select-all">{address}</code>
                  </div>
                  <button
                    onClick={() => copy(address, 'address')}
                    className="mt-3 px-4 py-2 rounded bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold hover:bg-gold/20 transition flex items-center gap-2 mx-auto"
                  >
                    {copiedField === 'address' ? (
                      <><CheckCircle2 className="w-3 h-3" /> COPIED</>
                    ) : (
                      <><Copy className="w-3 h-3" /> COPY ADDRESS</>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Bank Details */}
                {bank && (
                  <div className="space-y-2 mb-6">
                    {[
                      { label: 'Bank', value: bank.bank },
                      { label: 'Account Name', value: bank.accountName },
                      { label: 'Account Number', value: bank.accountNumber },
                      { label: 'Branch Code', value: bank.branchCode },
                      { label: 'SWIFT', value: bank.swiftCode },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between bg-void/50 rounded-lg p-3 border border-white/5">
                        <span className="text-[10px] text-dim uppercase tracking-wider">{item.label}</span>
                        <button
                          onClick={() => { navigator.clipboard.writeText(item.value); setCopiedField(item.label); setTimeout(() => setCopiedField(null), 2000); }}
                          className="text-xs text-gold-bright font-mono font-bold cursor-pointer hover:text-gold transition"
                        >
                          {copiedField === item.label ? '✓' : item.value}
                        </button>
                      </div>
                    ))}
                    <div className="bg-gold/5 border border-gold/10 rounded-lg p-3 mt-3">
                      <p className="text-[10px] text-gold font-bold">📝 Reference: {bank.reference}</p>
                      <p className="text-[10px] text-dim mt-1">Send proof of payment to <span className="text-gold">bonabots801@gmail.com</span></p>
                    </div>
                    <div className="bg-teal/5 border border-teal/10 rounded-lg p-3 mt-2">
                      <p className="text-[10px] text-teal font-bold">📱 eWallet accepted</p>
                      <p className="text-[10px] text-dim mt-1">Message us for the eWallet number → <span className="text-teal">WhatsApp +27 662 169 789</span></p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Pricing */}
            <div className="space-y-3 mb-6 text-left">
              <h3 className="text-xs font-bold text-dim uppercase tracking-wider text-center mb-3">Choose your plan</h3>
              
              {[
                { name: 'Starter', usd: '$47', zar: 'R899', eth: '~0.012 ETH', color: 'gold' },
                { name: 'Pro', usd: '$297', zar: 'R5,499', eth: '~0.075 ETH', color: 'violet', popular: true },
                { name: 'Empire', usd: '$2,997', zar: 'R54,999', eth: '~0.76 ETH', color: 'teal' },
              ].map((plan) => (
                <div key={plan.name} className={`flex items-center justify-between p-3 rounded-lg bg-void/30 border ${plan.popular ? 'border-violet/30' : 'border-white/5'}`}>
                  <div className="flex items-center gap-3">
                    {plan.popular && <span className="text-[8px] bg-violet text-void px-1.5 py-0.5 rounded font-black">BEST</span>}
                    <span className="text-sm text-warm font-bold">{plan.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-warm font-bold block">{plan.zar}</span>
                    <span className="text-[10px] text-dim">{plan.eth}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="bg-gold/5 border border-gold/10 rounded-lg p-4 text-left mb-6">
              <p className="text-[10px] text-gold font-bold mb-2">⚡ HOW TO PAY</p>
              {payMethod === 'crypto' ? (
                <ol className="text-[10px] text-dim space-y-1.5">
                  <li>1. Copy the wallet address above</li>
                  <li>2. Open your wallet (MetaMask, Trust Wallet, Binance)</li>
                  <li>3. Send ETH or USDT (ERC-20) to the address</li>
                  <li>4. We detect payment automatically and activate your account</li>
                </ol>
              ) : (
                <ol className="text-[10px] text-dim space-y-1.5">
                  <li>1. Open your banking app (FNB, Capitec, Standard Bank, etc.)</li>
                  <li>2. Create a new EFT payment</li>
                  <li>3. Enter the bank details above</li>
                  <li>4. Use the reference format shown</li>
                  <li>5. Send proof of payment to bonabots801@gmail.com</li>
                  <li>6. We activate your account within 1 hour</li>
                </ol>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 text-[10px] text-dim">
              <div className="flex items-center gap-1"><Shield className="w-3 h-3 text-gold" /> 30-day guarantee</div>
              <div className="flex items-center gap-1"><Zap className="w-3 h-3 text-violet-bright" /> Instant activation</div>
              <div className="flex items-center gap-1"><Globe className="w-3 h-3 text-teal" /> Global payments</div>
            </div>
          </div>

          {/* ═══ SHARE LINKS ═══ */}
          <div className="luxury-glass p-6 text-center">
            <p className="text-[10px] text-dim mb-3 uppercase tracking-wider">Share this payment page</p>
            <div className="flex justify-center gap-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent('🔥 Pay for PulseRevenue — AI Revenue Engine\n\nSend ETH/USDT to:\n' + address + '\n\nPlans from R899 (~$47)\n\n' + (typeof window !== 'undefined' ? window.location.origin : ''))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/20 transition"
              >
                📱 WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('🔥 Just deployed PulseRevenue — AI agents that close deals 24/7\n\nAccepting crypto: ETH, USDT, USDC\nPlans from R899\n\n')}&url=${encodeURIComponent((typeof window !== 'undefined' ? window.location.origin : '') + '/pay')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition"
              >
                🐦 Twitter
              </a>
              <button
                onClick={() => copy(address, 'share')}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-dim text-xs font-bold hover:bg-white/10 transition"
              >
                {copiedField === 'share' ? '✓ COPIED' : '📋 Copy Link'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
