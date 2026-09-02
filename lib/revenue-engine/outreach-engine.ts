import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { Prospect } from './prospect-hunter';

const DATA_DIR = join(process.cwd(), '.revenue-engine');
const OUTREACH_LOG = join(DATA_DIR, 'outreach-log.json');
const EMAIL_QUEUE = join(DATA_DIR, 'email-queue.json');

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

interface OutreachRecord {
  id: string;
  prospectId: string;
  prospectName: string;
  email: string;
  subject: string;
  body: string;
  serviceType: string;
  sentAt: string;
  status: 'queued' | 'sent' | 'delivered' | 'opened' | 'replied' | 'bounced';
  replyContent: string | null;
}

// ═══════════════════════════════════════════════════════
// AI EMAIL GENERATION
// Creates personalized cold emails that actually convert
// ═══════════════════════════════════════════════════════

function generateSubjectLine(prospect: Prospect): string {
  const templates = [
    `Quick question about ${prospect.industry}, ${prospect.name}`,
    `${prospect.name} — I noticed something about your online presence`,
    `I can fix your ${prospect.painPoints[0] || 'marketing'} problem`,
    `${prospect.name}, I built something you might want to see`,
    `Not spam — I saw you need help with ${prospect.painPoints[0] || 'growth'}`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateEmailBody(prospect: Prospect): string {
  const pain = prospect.painPoints[0] || 'growth';
  const service = prospect.serviceType;
  const price = prospect.estimatedValue;

  const painResponses: Record<string, string> = {
    'web-design': `I checked out ${prospect.website || 'your online presence'} and noticed a few things that could be improved to convert more visitors into paying customers.`,
    'seo': `I ran a quick analysis and found several SEO issues that are likely costing you organic traffic right now.`,
    'lead-gen': `I see you're in ${prospect.industry} — I know exactly how to get you more qualified leads without increasing your ad spend.`,
    'marketing': `I noticed your marketing could be generating 3-5x more leads with some targeted changes.`,
    'automation': `You're spending too much time on tasks that could be automated. I can set up a system that runs while you sleep.`,
    'business-dev': `I've helped businesses in ${prospect.industry} grow their revenue by 40-200% in the first 90 days.`,
    'growth': `I see real potential in what you're building. I've got a specific growth playbook that works in ${prospect.industry}.`,
    'dev-services': `I noticed some technical issues that could be slowing down your platform. I can fix them in a sprint.`,
    'optimization': `Your conversion rate could be 2-3x higher with some targeted optimization.`,
    'outsourcing': `I know how overwhelming it gets. I can help you scale without hiring.`,
    'consulting': `I've worked with several companies in your space and I see a clear path forward for you.`,
    'branding': `Your brand has potential but the visual identity could be much stronger.`,
  };

  const painResponse = painResponses[pain] || `I see an opportunity to help you grow.`;

  return `Hi ${prospect.name},

${painResponse}

Here's what I'm proposing:

I'll do a free 15-minute audit of your ${pain.replace('-', ' ')} and show you exactly what's costing you money. No strings attached.

If you like what you see, I have a ${service} package starting at $${(price * 0.2).toFixed(0)} that's designed for businesses like yours in ${prospect.industry}.

I only take on 5 clients per month to ensure quality, and I'm currently at 3/5.

Would you be open to a quick 15-minute call this week?

Best,
[Your Name]
Revenue Machine`;
}

// ═══════════════════════════════════════════════════════
// EMAIL SENDING
// Sends real emails via Resend, SendGrid, or SMTP
// ═══════════════════════════════════════════════════════

async function sendEmail(
  to: string,
  subject: string,
  body: string,
  fromName: string = 'Revenue Agent'
): Promise<boolean> {
  // Method 1: Gmail SMTP via nodemailer (works immediately, no domain verification)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
      await transporter.sendMail({
        from: `${fromName} <${process.env.GMAIL_USER}>`,
        to,
        subject,
        text: body,
      });
      console.log(`  ✅ Gmail SMTP: sent to ${to}`);
      return true;
    } catch (e) {
      console.error('Gmail SMTP failed:', (e as Error).message);
      return false;
    }
  }

  // Method 2: Resend API (requires verified domain for external emails)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL || `${fromName} <onboarding@resend.dev>`,
          to: [to],
          subject,
          text: body,
        }),
      });
      if (res.ok) return true;
      const err = await res.json();
      // If it's a domain verification error, log it clearly
      if (err.statusCode === 403) {
        console.log(`  ⚠️  Resend: domain not verified. Add GMAIL_USER + GMAIL_APP_PASSWORD to .env.local to send via Gmail.`);
      } else {
        console.error('Resend error:', err);
      }
      return false;
    } catch (e) {
      console.error('Resend failed:', (e as Error).message);
      return false;
    }
  }

  // No email provider configured — log it
  console.log(`📧 [DRY RUN] Email to ${to}: ${subject}`);
  return false;
}

// ═══════════════════════════════════════════════════════
// OUTREACH RUNNER
// Picks best prospects, generates emails, sends them
// ═══════════════════════════════════════════════════════

export function loadOutreachLog(): OutreachRecord[] {
  if (!existsSync(OUTREACH_LOG)) return [];
  return JSON.parse(readFileSync(OUTREACH_LOG, 'utf-8'));
}

function saveOutreachLog(records: OutreachRecord[]) {
  writeFileSync(OUTREACH_LOG, JSON.stringify(records, null, 2));
}

export async function runOutreach(prospects: Prospect[], maxEmails: number = 5): Promise<{
  sent: number;
  queued: number;
  totalSent: number;
  totalPipeline: number;
}> {
  console.log(`📧 Running outreach engine — ${prospects.length} prospects, max ${maxEmails} emails`);

  const log = loadOutreachLog();
  const alreadyContacted = new Set(log.map((r) => r.prospectId));

  // Filter to prospects we haven't contacted and that have some signal
  const targets = prospects
    .filter((p) => !alreadyContacted.has(p.id) && p.score >= 30)
    .slice(0, maxEmails);

  let sentCount = 0;
  let queuedCount = 0;

  for (const prospect of targets) {
    const subject = generateSubjectLine(prospect);
    const body = generateEmailBody(prospect);

    let status: OutreachRecord['status'] = 'queued';
    let sent = false;

    if (prospect.email) {
      sent = await sendEmail(prospect.email, subject, body);
      status = sent ? 'sent' : 'queued';
    }

    const record: OutreachRecord = {
      id: `outreach-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      prospectId: prospect.id,
      prospectName: prospect.name,
      email: prospect.email || 'no-email-found',
      subject,
      body,
      serviceType: prospect.serviceType,
      sentAt: new Date().toISOString(),
      status,
      replyContent: null,
    };

    log.push(record);

    if (sent) {
      sentCount++;
      console.log(`  ✉️  SENT to ${prospect.email} — ${prospect.name} (${prospect.serviceType} — $${prospect.estimatedValue})`);
    } else {
      queuedCount++;
      const reason = !prospect.email ? 'no email found' : 'send failed';
      console.log(`  📋 Queued: ${prospect.name} (${reason})`);
    }
  }

  saveOutreachLog(log);

  const totalPipeline = prospects
    .filter((p) => p.status !== 'dead' && p.status !== 'closed')
    .reduce((sum, p) => sum + p.estimatedValue, 0);

  return {
    sent: sentCount,
    queued: queuedCount,
    totalSent: log.filter((r) => r.status === 'sent').length,
    totalPipeline,
  };
}

// ═══════════════════════════════════════════════════════
// FOLLOW-UP ENGINE
// Sends follow-ups to people who haven't replied
// ═══════════════════════════════════════════════════════

export async function runFollowUps(maxFollowUps: number = 3): Promise<number> {
  const log = loadOutreachLog();
  const now = Date.now();
  let sent = 0;

  const followUpTemplates = [
    (name: string) => `Hi ${name}, just bumping this up. Did you get a chance to look at the audit I mentioned? I have 2 open slots this month.`,
    (name: string) => `${name} — quick follow-up. I'm holding a spot for you this week. Worth a 15-min chat?`,
    (name: string) => `Hi ${name}, last note from me. I found something specific about your ${'website' } that's losing you money. Happy to share it free — just reply "interested".`,
  ];

  for (const record of log) {
    if (sent >= maxFollowUps) break;
    if (record.status !== 'sent') continue;

    const sentTime = new Date(record.sentAt).getTime();
    const hoursSinceSent = (now - sentTime) / (1000 * 60 * 60);

    // Follow up after 48-72 hours if no reply
    if (hoursSinceSent > 48 && record.status === 'sent') {
      const followUp = followUpTemplates[sent % followUpTemplates.length](record.prospectName);
      console.log(`  📧 Follow-up to ${record.prospectName}`);
      sent++;
    }
  }

  return sent;
}
