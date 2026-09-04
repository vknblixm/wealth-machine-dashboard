import { NextRequest, NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════
// STRIPE SESSION VERIFIER
// Verifies a checkout session after redirect (no npm package needed)
// ═══════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'session_id required' }, { status: 400 });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes('xxx')) {
    // No Stripe key — just confirm it looks valid
    return NextResponse.json({
      status: 'unknown',
      message: 'Stripe not configured — payment may have succeeded',
      sessionId,
    });
  }

  try {
    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
      {
        headers: {
          'Authorization': `Bearer ${key}`,
        },
      }
    );

    const session = await response.json();

    if (session.error) {
      return NextResponse.json({
        status: 'error',
        message: session.error.message,
      });
    }

    return NextResponse.json({
      status: session.payment_status || session.status,
      customer_email: session.customer_email || session.customer_details?.email,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status,
      metadata: session.metadata,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
    });
  }
}
