import { NextRequest, NextResponse } from 'next/server';

// Real Stripe webhook handler — triggers on successful payments
// Set STRIPE_WEBHOOK_SECRET in .env.local from your Stripe dashboard

// In-memory transaction log (replace with database)
const transactions: Array<{
  sessionId: string;
  email: string;
  amount: number;
  status: string;
  timestamp: string;
}> = [];

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  // If no webhook secret configured, accept raw data
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    try {
      const data = JSON.parse(body);
      transactions.push({
        sessionId: data.sessionId || 'demo',
        email: data.customer_email || data.email || 'unknown',
        amount: data.amount_total || 0,
        status: 'completed',
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ received: true, demo: true });
    } catch {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
  }

  // Real Stripe webhook verification
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const transaction = {
        sessionId: session.id,
        email: session.customer_email || session.metadata?.email || '',
        amount: session.amount_total || 0,
        status: 'completed',
        timestamp: new Date().toISOString(),
      };
      transactions.push(transaction);

      // TODO: Trigger fulfillment
      // - Send access email
      // - Add to course platform
      // - Notify Slack
      // - Update CRM
      console.log('💰 PAYMENT RECEIVED:', transaction);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// GET endpoint to check recent transactions
export async function GET() {
  return NextResponse.json({
    totalTransactions: transactions.length,
    totalRevenue: transactions.reduce((sum, t) => sum + t.amount, 0),
    recentTransactions: transactions.slice(-20),
  });
}
