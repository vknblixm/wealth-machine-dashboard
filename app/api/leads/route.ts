import { NextRequest, NextResponse } from 'next/server';

// Real lead capture — stores leads and can forward to any email service
// Connect to Mailchimp, ConvertKit, Resend, etc. by adding API keys

interface Lead {
  email: string;
  name?: string;
  source: string;
  timestamp: string;
}

// In-memory store (replace with database in production)
const leads: Lead[] = [];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, name, source } = body;

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const lead: Lead = {
    email: email.toLowerCase().trim(),
    name: name || '',
    source: source || 'landing-page',
    timestamp: new Date().toISOString(),
  };

  // Store lead
  leads.push(lead);

  // Forward welcome email via Resend API if configured
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL || 'PulseRevenue <onboarding@resend.dev>',
          to: email,
          subject: '🔥 Welcome to PulseRevenue — Your AI Revenue Engine',
          text: `Hi ${name || 'there'},\n\nYou're in! Your AI revenue engine is activating.\n\nWhat's coming:\n- AI agents hunting revenue 24/7\n- Automated deal closing pipeline\n- Real-time revenue tracking\n\nWe'll be in touch within 24 hours with your access.\n\n— PulseRevenue`,
        }),
      });
      console.log(`[LEAD] Welcome email sent to ${email}`);
    } catch (e: any) {
      console.error('Lead email failed:', e.message);
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Lead captured',
    totalLeads: leads.length,
    leads: leads.slice(-5), // Last 5 leads
  });
}

export async function GET() {
  return NextResponse.json({
    totalLeads: leads.length,
    leads: leads.slice(-20),
  });
}
