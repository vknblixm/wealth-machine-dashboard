import { NextRequest, NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════
// PAYMENT CHECKOUT — Stripe (primary) + Paystack (fallback)
// Uses Stripe REST API directly (no npm package needed)
// ═══════════════════════════════════════════════════════

const PRODUCTS: Record<string, { name: string; amount: number; currency: string; stripePriceId?: string }> = {
  // USD prices (cents)
  starter:     { name: 'WEALTH MACHINE — STARTER',  amount: 4700,    currency: 'usd' },
  pro:         { name: 'WEALTH MACHINE — PRO',      amount: 29700,   currency: 'usd' },
  empire:      { name: 'WEALTH MACHINE — EMPIRE',   amount: 299700,  currency: 'usd' },
  // ZAR prices (cents)
  starter_zar: { name: 'WEALTH MACHINE — STARTER',  amount: 89900,   currency: 'zar' },
  pro_zar:     { name: 'WEALTH MACHINE — PRO',      amount: 549900,  currency: 'zar' },
  empire_zar:  { name: 'WEALTH MACHINE — EMPIRE',   amount: 5499900, currency: 'zar' },
};

function generateRef(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = 'WM-';
  for (let i = 0; i < 12; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

// ═══ STRIPE CHECKOUT (via REST API — no npm package needed) ═══

async function createStripeCheckout(
  product: typeof PRODUCTS[string],
  email: string,
  name: string,
  productId: string,
): Promise<{ url: string } | null> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes('xxx')) return null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4200';

  // Build line items — use dynamic pricing (no pre-created Price objects needed)
  const lineItems = [{
    price_data: {
      currency: product.currency,
      product_data: {
        name: product.name,
        description: `Access to ${product.name} — AI Revenue Engine`,
        metadata: { product_id: productId },
      },
      unit_amount: product.amount, // Already in cents
    },
    quantity: 1,
  }];

  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('success_url', `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`);
  params.append('cancel_url', `${appUrl}/sell`);
  params.append('customer_email', email);
  params.append('client_reference_id', generateRef());
  params.append('line_items[0][price_data][currency]', product.currency);
  params.append('line_items[0][price_data][product_data][name]', product.name);
  params.append('line_items[0][price_data][product_data][description]', `Access to ${product.name}`);
  params.append('line_items[0][price_data][unit_amount]', String(product.amount));
  params.append('line_items[0][quantity]', '1');

  // Metadata
  params.append('metadata[email]', email);
  params.append('metadata[name]', name || '');
  params.append('metadata[product_id]', productId);
  params.append('metadata[product_name]', product.name);

  // Allow promotion codes
  params.append('allow_promotion_codes', 'true');

  // Automatic tax collection
  params.append('automatic_tax[enabled]', 'true');

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await response.json();

  if (data.error) {
    console.error('Stripe checkout error:', data.error.message);
    return null;
  }

  console.log(`[STRIPE] Checkout session created: ${product.name} (${product.currency.toUpperCase()} ${(product.amount / 100).toLocaleString()}) for ${email} — session: ${data.id}`);
  return { url: data.url };
}

// ═══ PAYSTACK CHECKOUT (fallback) ═══

async function createPaystackCheckout(
  product: typeof PRODUCTS[string],
  email: string,
  name: string,
  productId: string,
): Promise<{ url: string } | null> {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key || key.includes('xxx')) return null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4200';
  const reference = generateRef();

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: product.amount,
        currency: product.currency.toUpperCase(),
        reference,
        callback_url: `${appUrl}/api/webhooks/paystack`,
        metadata: {
          name: name || '',
          email,
          product_id: productId,
          product_name: product.name,
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      console.error('Paystack init error:', data);
      return null;
    }

    console.log(`[PAYSTACK] Checkout initiated: ${product.name} for ${email} — ref: ${reference}`);
    return { url: data.data.authorization_url };
  } catch (error: any) {
    console.error('Paystack error:', error.message);
    return null;
  }
}

// ═══ MAIN HANDLER ═══

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, email, name } = body;

  if (!productId || !PRODUCTS[productId]) {
    return NextResponse.json(
      { error: 'Invalid product. Options: ' + Object.keys(PRODUCTS).join(', ') },
      { status: 400 }
    );
  }

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const product = PRODUCTS[productId];

  // Try Stripe first (works globally, including SA)
  const stripeResult = await createStripeCheckout(product, email, name, productId);
  if (stripeResult) {
    return NextResponse.json({
      live: true,
      provider: 'stripe',
      url: stripeResult.url,
      product: product.name,
      amount: product.amount / 100,
      currency: product.currency.toUpperCase(),
    });
  }

  // Fallback to Paystack
  const paystackResult = await createPaystackCheckout(product, email, name, productId);
  if (paystackResult) {
    return NextResponse.json({
      live: true,
      provider: 'paystack',
      url: paystackResult.url,
      product: product.name,
      amount: product.amount / 100,
      currency: product.currency.toUpperCase(),
    });
  }

  // Neither configured
  return NextResponse.json({
    live: false,
    message: 'No payment provider configured',
    instructions: [
      'Option A (Stripe — recommended, works globally):',
      '  1. Sign up at https://dashboard.stripe.com (free)',
      '  2. Go to Developers → API Keys → Copy Secret Key (sk_test_xxx)',
      '  3. Add STRIPE_SECRET_KEY=sk_test_xxx to .env.local',
      '',
      'Option B (Paystack — 7 day approval):',
      '  1. Add PAYSTACK_SECRET_KEY=sk_test_xxx to .env.local',
    ],
    product: product.name,
    amount: product.amount / 100,
    currency: product.currency.toUpperCase(),
  });
}

// GET — show available products
export async function GET() {
  const products = Object.entries(PRODUCTS).map(([id, p]) => ({
    id,
    name: p.name,
    amount: p.amount / 100,
    currency: p.currency.toUpperCase(),
  }));
  return NextResponse.json({ products });
}
