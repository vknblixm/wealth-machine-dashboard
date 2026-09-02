import { NextRequest, NextResponse } from 'next/server';

// Real Paystack checkout — works in South Africa + accepts global card payments
// PAYSTACK_SECRET_KEY must be set in .env.local

const PRODUCTS: Record<string, { name: string; amount: number; currency: string }> = {
  starter:  { name: 'WEALTH MACHINE — STARTER',  amount: 4700,   currency: 'USD' },   // $47
  pro:      { name: 'WEALTH MACHINE — PRO',      amount: 29700,  currency: 'USD' },   // $297
  empire:   { name: 'WEALTH MACHINE — EMPIRE',   amount: 299700, currency: 'USD' },   // $2997
  // ZAR options (South African Rand)
  starter_zar:  { name: 'WEALTH MACHINE — STARTER',  amount: 89900,  currency: 'ZAR' },  // R899
  pro_zar:      { name: 'WEALTH MACHINE — PRO',      amount: 549900, currency: 'ZAR' },  // R5,499
  empire_zar:   { name: 'WEALTH MACHINE — EMPIRE',   amount: 5499900, currency: 'ZAR' }, // R54,999
};

function generateRef(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = 'WM-';
  for (let i = 0; i < 12; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, email, name } = body;

  if (!productId || !PRODUCTS[productId]) {
    return NextResponse.json(
      { error: 'Invalid productId. Valid: ' + Object.keys(PRODUCTS).join(', ') },
      { status: 400 }
    );
  }

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const product = PRODUCTS[productId];
  const reference = generateRef();

  // If no Paystack key configured, tell them exactly what to do
  if (!process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY.includes('xxx')) {
    return NextResponse.json({
      live: false,
      message: 'Paystack test key not configured yet',
      instructions: [
        '1. Go to https://dashboard.paystack.com',
        '2. Sign up (free, works in South Africa)',
        '3. Go to Settings → API Keys & Webhooks',
        '4. Copy your Test Secret Key (sk_test_xxx)',
        '5. Copy your Test Publishable Key (pk_test_xxx)',
        '6. Paste into .env.local',
        '7. Restart the server',
      ],
      product: product.name,
      amount: product.amount,
      currency: product.currency,
    });
  }

  try {
    const amountInCurrency = product.amount; // Already in kobo/cents

    const payload = {
      email,
      amount: amountInCurrency,
      currency: product.currency,
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4200'}/api/webhooks/paystack`,
      metadata: {
        name: name || '',
        email,
        product_id: productId,
        product_name: product.name,
        custom_fields: [
          {
            display_name: 'Product',
            variable_name: 'product',
            value: product.name,
          },
        ],
      },
    };

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.status) {
      console.error('Paystack init error:', data);
      return NextResponse.json(
        { error: data.message || 'Failed to initialize payment' },
        { status: 500 }
      );
    }

    // Log this for the revenue engine
    console.log(`[PAYMENT] Checkout initiated: ${product.name} (${product.currency} ${product.amount / 100}) by ${email} — ref: ${reference}`);

    return NextResponse.json({
      live: true,
      url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
      product: product.name,
      amount: product.amount / 100,
      currency: product.currency,
    });
  } catch (error: any) {
    console.error('Paystack error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET — show available products
export async function GET() {
  const products = Object.entries(PRODUCTS).map(([id, p]) => ({
    id,
    name: p.name,
    amount: p.amount / 100,
    currency: p.currency,
  }));
  return NextResponse.json({ products });
}
