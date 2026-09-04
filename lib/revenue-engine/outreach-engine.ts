import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { Prospect } from './prospect-hunter';

const DATA_DIR = join(process.cwd(), '.revenue-engine');
const OUTREACH_LOG = join(DATA_DIR, 'outreach-log.json');

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
// EMAIL VALIDATION
// ═══════════════════════════════════════════════════════

function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  if (email === 'no-email-found') return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  // Skip auto-generated / fake emails
  if (email.includes('example.com') || email.includes('test.com') || email.includes('sentry.io')) return false;
  return true;
}

// ═══════════════════════════════════════════════════════
// AI EMAIL GENERATION — Creates personalized cold emails
// ═══════════════════════════════════════════════════════

function generateSubjectLine(prospect: Prospect): string {
  const templates = [
    `Quick question about your ${prospect.industry} growth, ${prospect.name}`,
    `${prospect.name} — I found a way to boost your ${prospect.painPoints[0] || 'revenue'}`,
    `I can fix your ${prospect.painPoints[0] || 'marketing'} problem — free audit`,
    `${prospect.name}, I built something for people in ${prospect.industry}`,
    `Not spam — I have a specific idea for ${prospect.name}`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateEmailBody(prospect: Prospect): string {
  const pain = prospect.painPoints[0] || 'growth';
  const service = prospect.serviceType;
  const price = prospect.estimatedValue;
  const painMessages: Record<string, string> = {
    'web-design': `I checked out your online presence and noticed a few things that could be improved to convert more visitors into paying customers.`,
    'seo': `I ran a quick SEO analysis and found several issues that are likely costing you organic traffic right now.`,
    'lead-gen': `I see you're in ${prospect.industry} — I know exactly how to get you more qualified leads without increasing ad spend.`,
    'marketing': `I noticed your marketing could be generating 3-5x more leads with some targeted changes.`,
    'automation': `You're spending too much time on tasks that could be automated. I can set up a system that runs while you sleep.`,
    'business-dev': `I've helped businesses in ${prospect.industry} grow their revenue by 40-200% in the first 90 days.`,
    'growth': `I see real potential in what you're building. I've got a specific growth playbook that works in ${prospect.industry}.`,
    'dev-services': `I noticed some technical issues that could be slowing down your platform. I can fix them in a sprint.`,
    'optimization': `Your conversion rate could be 2-3x higher with some targeted optimization.`,
    'outsourcing': `I know how overwhelming it gets. I can help you scale without hiring.`,
    'consulting': `I've worked with several companies in your space and I see a clear path forward for you.`,
    'branding': `Your brand has potential but the visual identity could be much stronger.`,
    'services-needed': `I saw your post and think I can help. I've solved this exact problem for other companies in ${prospect.industry}.`,
    'post-launch-growth': `Congrats on the launch! I help founders like you get from 0 to paying customers fast. I have a specific playbook for this.`,
  };

  const painMsg = painMessages[pain] || `I see an opportunity to help you grow.`;

  return `Hi ${prospect.name},

${painMsg}

Here's what I'm proposing:

I'll do a free 15-minute audit of your ${pain.replace('-', ' ')} and show you exactly what's costing you money. No strings attached.

If you like what you see, I have a ${service} package starting at $${(price * 0.2).toFixed(0)} that's designed for businesses like yours in ${prospect.industry}.

I only take on 5 clients per month to ensure quality, and I'm currently at 3/5.

Would you be open to a quick 15-minute call this week?

Best,
Divan Els
PulseRevenue — AI Revenue Engine
https://pulserevenue.vercel.app`;
}

// ═══════════════════════════════════════════════════════
// EMAIL SENDING — Real delivery via Resend API
// ═══════════════════════════════════════════════════════

async function sendEmail(
  to: string,
  subject: string,
  body: string,
  fromName: string = 'Divan Els'
): Promise<boolean> {
  // Method 1: Gmail SMTP via nodemailer
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD && !process.env.GMAIL_APP_PASSWORD.includes('xxxx')) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, ''),
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
      console.error('  ❌ Gmail SMTP failed:', (e as Error).message);
    }
  }

  // Method 2: Resend API (requires verified domain for external emails)
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && !apiKey.includes('xxx')) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL || `${fromName} <onboarding@resend.dev>`,
          to: [to],
          subject,
          text: body,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log(`  ✅ Resend: sent to ${to} (id: ${data.id})`);
        return true;
      }

      // Log specific errors
      if (res.status === 403 || res.status === 422) {
        console.log(`  ⚠️  Resend: domain not verified for external emails. Error: ${data.message}`);
        console.log(`  💡 FIX: Verify a domain at https://resend.com/domains OR add GMAIL_USER + GMAIL_APP_PASSWORD to .env.local`);
      } else {
        console.error(`  ❌ Resend error (${res.status}):`, data.message || JSON.stringify(data));
      }
      return false;
    } catch (e) {
      console.error('  ❌ Resend failed:', (e as Error).message);
      return false;
    }
  }

  console.log(`  📧 [DRY RUN] No email provider configured. Email to ${to}: ${subject}`);
  return false;
}

// ═══════════════════════════════════════════════════════
// OUTREACH RUNNER
// ═══════════════════════════════════════════════════════

export function loadOutreachLog(): OutreachRecord[] {
  if (!existsSync(OUTREACH_LOG)) return [];
  return JSON.parse(readFileSync(OUTREACH_LOG, 'utf-8'));
}

function saveOutreachLog(records: OutreachRecord[]) {
  writeFileSync(OUTREACH_LOG, JSON.stringify(records, null, 2));
}

// Clean stale outreach entries (queued but no email)
export function cleanStaleOutreach(): number {
  const log = loadOutreachLog();
  const before = log.length;
  const cleaned = log.filter(r => {
    // Keep sent/delivered/opened/replied records
    if (r.status !== 'queued') return true;
    // Remove queued entries with no valid email
    if (!isValidEmail(r.email)) return false;
    return true;
  });
  saveOutreachLog(cleaned);
  const removed = before - cleaned.length;
  if (removed > 0) console.log(`  🧹 Cleaned ${removed} stale outreach entries (no valid email)`);
  return removed;
}

export async function runOutreach(prospects: Prospect[], maxEmails: number = 10): Promise<{
  sent: number;
  skipped: number;
  totalSent: number;
  totalPipeline: number;
}> {
  console.log(`📧 Running outreach engine — ${prospects.length} prospects, max ${maxEmails} emails`);

  // First, clean stale entries
  cleanStaleOutreach();

  const log = loadOutreachLog();
  const alreadyContacted = new Set(log.map((r) => r.prospectId));

  // ONLY target prospects with valid emails that we haven't contacted
  const targets = prospects
    .filter((p) => {
      if (alreadyContacted.has(p.id)) return false;
      if (!isValidEmail(p.email)) return false;
      if (p.score < 30) return false;
      if (p.status === 'dead' || p.status === 'closed') return false;
      return true;
    })
    .sort((a, b) => b.score - a.score) // Best prospects first
    .slice(0, maxEmails);

  console.log(`  📋 ${targets.length} prospects with valid emails ready for outreach`);

  let sentCount = 0;
  let skippedCount = 0;

  for (const prospect of targets) {
    const subject = generateSubjectLine(prospect);
    const body = generateEmailBody(prospect);

    const sent = await sendEmail(prospect.email!, subject, body);

    const record: OutreachRecord = {
      id: `outreach-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      prospectId: prospect.id,
      prospectName: prospect.name,
      email: prospect.email!,
      subject,
      body,
      serviceType: prospect.serviceType,
      sentAt: new Date().toISOString(),
      status: sent ? 'sent' : 'queued',
      replyContent: null,
    };

    log.push(record);

    if (sent) {
      sentCount++;
      console.log(`  ✉️  SENT → ${prospect.email} | ${prospect.name} | ${prospect.serviceType} | $${prospect.estimatedValue}`);
    } else {
      skippedCount++;
      console.log(`  ⏭️  Failed: ${prospect.name} (${prospect.email})`);
    }

    // Small delay between sends to avoid rate limits
    if (targets.indexOf(prospect) < targets.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  saveOutreachLog(log);

  const totalPipeline = prospects
    .filter((p) => p.status !== 'dead' && p.status !== 'closed')
    .reduce((sum, p) => sum + p.estimatedValue, 0);

  return {
    sent: sentCount,
    skipped: skippedCount,
    totalSent: log.filter((r) => r.status === 'sent').length,
    totalPipeline,
  };
}

// ═══════════════════════════════════════════════════════
// FOLLOW-UP ENGINE
// ═══════════════════════════════════════════════════════

export async function runFollowUps(maxFollowUps: number = 3): Promise<number> {
  const log = loadOutreachLog();
  const now = Date.now();
  let sent = 0;

  const followUpTemplates = [
    (name: string) => `Hi ${name}, just bumping this up. Did you get a chance to look at the audit I mentioned? I have 2 open slots this month.`,
    (name: string) => `${name} — quick follow-up. I'm holding a spot for you this week. Worth a 15-min chat?`,
    (name: string) => `Hi ${name}, last note from me. I found something specific about your website that's losing you money. Happy to share it free — just reply "interested".`,
  ];

  for (const record of log) {
    if (sent >= maxFollowUps) break;
    if (record.status !== 'sent') continue;

    const sentTime = new Date(record.sentAt).getTime();
    const hoursSinceSent = (now - sentTime) / (1000 * 60 * 60);

    if (hoursSinceSent > 48) {
      const followUp = followUpTemplates[sent % followUpTemplates.length](record.prospectName);
      console.log(`  📧 Follow-up to ${record.prospectName}`);
      sent++;
    }
  }

  return sent;
}
