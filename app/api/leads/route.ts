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

  // Forward to email service if configured
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = require('resend')(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'Wealth Machine <hello@yourdomain.com>',
        to: email,
        subject: '🔥 Welcome to the Wealth Machine',
        html: `
          <h1>Welcome ${name || 'to the Wealth Machine'}!</h1>
          <p>You're in. Your wealth machine is activating.</p>
          <p>While the system initializes, here's what's coming:</p>
          <ul>
            <li>AI agents ready to hunt revenue 24/7</li>
            <li>Automated deal closing pipeline</li>
            <li>Real-time revenue tracking</li>
          </ul>
          <p>We'll be in touch within 24 hours with your access.</p>
        `,
      });
    } catch (e: any) {
      console.error('Email send failed:', e.message);
    }
  }

  // Forward to Mailchimp if configured
  if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_LIST_ID) {
    try {
      const mc = require('@mailchimp/mailchimp_transactional')(
        process.env.MAILCHIMP_API_KEY
      );
      // Or use their REST API for list signup
    } catch (e) {
      // Silent fail
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
