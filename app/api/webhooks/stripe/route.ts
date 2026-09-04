import { NextRequest, NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════
// STRIPE WEBHOOK — Confirms payments and triggers fulfillment
// Uses raw HMAC verification (no Stripe npm package needed)
// ═══════════════════════════════════════════════════════
import { createHmac } from 'crypto';

const transactions: Array<{
  sessionId: string;
  email: string;
  amount: number;
  currency: string;
  product: string;
  status: string;
  timestamp: string;
}> = [];

// Read the raw body for signature verification
async function getRawBody(req: NextRequest): Promise<string> {
  const reader = req.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

// Verify Stripe webhook signature using HMAC-SHA256
function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
): boolean {
  try {
    const parts = sigHeader.split(',').reduce((acc: Record<string, string>, part) => {
      const [key, val] = part.split('=');
      acc[key] = val!;
      return acc;
    }, {});

    const timestamp = parts['t'];
    const signature = parts['v1'];

    if (!timestamp || !signature) return false;

    // Check timestamp is within 5 minutes
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - parseInt(timestamp)) > 300) return false;

    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    return expectedSignature === signature;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await getRawBody(req);
  const sig = req.headers.get('stripe-signature') || '';

  // If no webhook secret, accept directly (for testing)
  if (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET.includes('xxx')) {
    try {
      const data = JSON.parse(rawBody);
      const event = data;

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const transaction = {
          sessionId: session.id || 'demo',
          email: session.customer_email || session.metadata?.email || 'unknown',
          amount: session.amount_total || 0,
          currency: session.currency || 'usd',
          product: session.metadata?.product_name || 'Unknown',
          status: 'completed',
          timestamp: new Date().toISOString(),
        };
        transactions.push(transaction);
        console.log('💰 PAYMENT RECEIVED (unverified):', transaction);
      }

      return NextResponse.json({ received: true, mode: 'unverified' });
    } catch {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
  }

  // Verified webhook
  if (!verifyStripeSignature(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)) {
    console.error('Stripe webhook signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const transaction = {
        sessionId: session.id,
        email: session.customer_email || session.metadata?.email || '',
        amount: session.amount_total || 0,
        currency: session.currency || 'usd',
        product: session.metadata?.product_name || 'Unknown',
        status: 'completed',
        timestamp: new Date().toISOString(),
      };
      transactions.push(transaction);
      console.log('💰 PAYMENT RECEIVED (verified):', transaction);

      // TODO: Trigger fulfillment
      // - Send access email via Resend
      // - Add to course platform
      // - Notify founders
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// GET — check recent transactions
export async function GET() {
  return NextResponse.json({
    totalTransactions: transactions.length,
    totalRevenue: transactions.reduce((sum, t) => sum + t.amount, 0),
    recentTransactions: transactions.slice(-20),
  });
}
