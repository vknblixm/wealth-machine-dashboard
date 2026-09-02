import { NextRequest, NextResponse } from 'next/server';

// Paystack webhook — verifies payments and triggers fulfillment
// Configure webhook URL in Paystack Dashboard → Settings → Webhooks

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Paystack sends events as: { event: "charge.success", data: { ... } }
  const event = body.event;
  const data = body.data;

  if (!event || !data) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  console.log(`[PAYSTACK WEBHOOK] Event: ${event}`);

  // Verify the transaction with Paystack
  if (process.env.PAYSTACK_SECRET_KEY && !process.env.PAYSTACK_SECRET_KEY.includes('xxx')) {
    try {
      const verifyRes = await fetch(
        `https://api.paystack.co/transaction/verify/${data.reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );
      const verification = await verifyRes.json();

      if (!verification.status || verification.data.status !== 'success') {
        console.error(`[PAYSTACK WEBHOOK] Verification failed for ${data.reference}`);
        return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
      }

      console.log(`[PAYSTACK WEBHOOK] ✅ Payment verified: ${data.reference}`);
    } catch (e: any) {
      console.error(`[PAYSTACK WEBHOOK] Verify error: ${e.message}`);
    }
  }

  // Handle specific events
  switch (event) {
    case 'charge.success':
      await handleSuccessfulPayment(data);
      break;
    case 'charge.failed':
      console.error(`[PAYMENT FAILED] ${data.reference} — ${data.amount / 100} ${data.currency}`);
      break;
    case 'refund.created':
      console.log(`[REFUND] ${data.reference} — ${data.amount / 100} ${data.currency}`);
      break;
    default:
      console.log(`[PAYSTACK WEBHOOK] Unhandled event: ${event}`);
  }

  return NextResponse.json({ received: true });
}

async function handleSuccessfulPayment(data: any) {
  const amount = data.amount / 100;
  const email = data.customer?.email || 'unknown';
  const reference = data.reference;
  const metadata = data.metadata || {};
  const productName = metadata.product_name || 'Unknown Product';

  console.log(`\n💰💰💰 PAYMENT RECEIVED 💰💰💰`);
  console.log(`Product: ${productName}`);
  console.log(`Amount: ${data.currency} ${amount}`);
  console.log(`Customer: ${email}`);
  console.log(`Reference: ${reference}`);
  console.log(`\n`);

  // TODO: Trigger fulfillment
  // 1. Send welcome email with product access
  // 2. Add to email list / CRM
  // 3. Grant access to product
  // 4. Notify via Discord webhook

  // Send welcome email via Resend
  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('xxx')) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL || 'Wealth Machine <onboarding@resend.dev>',
          to: email,
          subject: `🔥 Welcome to ${productName} — Your Wealth Machine is LIVE`,
          html: `
            <div style="font-family: monospace; background: #0a0e27; color: #00ff41; padding: 40px;">
              <h1 style="color: #00ff41;">Welcome to the Wealth Machine, ${metadata.name || 'Champion'}!</h1>
              <p style="color: #ccc;">Your <strong>${productName}</strong> is now active.</p>
              <div style="background: #1a1f3a; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #00d9ff;">Order: ${reference}</p>
                <p style="color: #00d9ff;">Amount: ${data.currency} ${amount}</p>
              </div>
              <h2 style="color: #fff;">Next Steps:</h2>
              <ol style="color: #ccc;">
                <li>Check your email for login credentials</li>
                <li>Configure your first AI agent (5 min)</li>
                <li>Watch the machine start hunting</li>
              </ol>
              <p style="color: #ff006e; margin-top: 30px;">⚡ Your revenue agents are warming up...</p>
            </div>
          `,
        }),
      });
      console.log(`[FULFILLMENT] Welcome email sent to ${email}`);
    } catch (e: any) {
      console.error(`[FULFILLMENT] Email error: ${e.message}`);
    }
  }

  // Discord notification
  if (process.env.DISCORD_WEBHOOK_URL) {
    try {
      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: '💰 NEW PAYMENT RECEIVED',
            description: `**${productName}**\nAmount: ${data.currency} ${amount}\nCustomer: ${email}\nRef: ${reference}`,
            color: 0x00ff41,
            timestamp: new Date().toISOString(),
          }],
        }),
      });
    } catch (e: any) {
      console.error(`[DISCORD] Error: ${e.message}`);
    }
  }
}
