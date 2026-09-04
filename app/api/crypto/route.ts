import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateWallet, getWalletPublicInfo, checkBalance, getRecentTransactions } from '@/lib/revenue-engine/crypto-wallet';

// ═══════════════════════════════════════════════════════
// CRYPTO WALLET API
// GET  → wallet info + balance + recent txns
// POST → check balance or verify a payment
// ═══════════════════════════════════════════════════════

export async function GET() {
  const wallet = getWalletPublicInfo();

  // Check balance in background
  let balance;
  try {
    balance = await checkBalance(wallet.address);
  } catch {
    balance = { eth: '0', usdt: '0', usdc: '0', totalUsdEstimate: '0' };
  }

  // Get recent transactions
  let transactions;
  try {
    transactions = await getRecentTransactions(wallet.address);
  } catch {
    transactions = [];
  }

  return NextResponse.json({
    ...wallet,
    balance,
    recentTransactions: transactions,
    status: 'active',
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  const wallet = getOrCreateWallet();

  if (action === 'balance') {
    try {
      const balance = await checkBalance(wallet.address);
      return NextResponse.json({ address: wallet.address, balance });
    } catch {
      return NextResponse.json({ address: wallet.address, balance: { eth: '0', usdt: '0', usdc: '0', totalUsdEstimate: '0' } });
    }
  }

  if (action === 'withdraw-info') {
    // Return withdrawal instructions (never expose private key via API)
    return NextResponse.json({
      address: wallet.address,
      instructions: [
        '1. Install MetaMask (browser extension) or Trust Wallet (mobile)',
        '2. Click "Import Wallet" or "Import Account"',
        '3. Select "Private Key" import method',
        '4. Paste your private key (stored in .env.local as CRYPTO_WALLET_PRIVATE_KEY)',
        '5. Your balance will appear — send to any exchange or wallet',
        '',
        '⚠️ IMPORTANT: Never share your private key with anyone.',
        'The private key is stored in .env.local on your server only.',
      ],
      withdrawalMethods: [
        'MetaMask → Send to exchange (Binance, Luno, VALR)',
        'Trust Wallet → Direct send',
        'Command line → ethers.js signed transaction',
      ],
    });
  }

  return NextResponse.json({ error: 'Unknown action. Use: balance, withdraw-info' }, { status: 400 });
}
