import { NextRequest, NextResponse } from 'next/server';
import { runEngineCycle, startEngine, stopEngine, getEngineStatus } from '@/lib/revenue-engine/orchestrator';
import { loadProspects } from '@/lib/revenue-engine/prospect-hunter';
import { loadOutreachLog } from '@/lib/revenue-engine/outreach-engine';
import { getDeliveryStats } from '@/lib/revenue-engine/service-delivery';

// GET — Get full engine status
export async function GET() {
  const status = getEngineStatus();
  const prospects = loadProspects();
  const outreachLog = loadOutreachLog();
  const deliveries = getDeliveryStats();

  return NextResponse.json({
    status,
    prospects: {
      total: prospects.length,
      found: prospects.filter((p) => p.status === 'found').length,
      contacted: prospects.filter((p) => p.status === 'contacted').length,
      replied: prospects.filter((p) => p.status === 'replied').length,
      closed: prospects.filter((p) => p.status === 'closed').length,
      topProspects: prospects.slice(0, 10).map((p) => ({
        name: p.name,
        industry: p.industry,
        painPoints: p.painPoints,
        score: p.score,
        estimatedValue: p.estimatedValue,
        source: p.source,
      })),
    },
    outreach: {
      totalSent: outreachLog.length,
      emailsSent: outreachLog.filter((r) => r.status === 'sent').length,
      queued: outreachLog.filter((r) => r.status === 'queued').length,
      recentEmails: outreachLog.slice(-5).map((r) => ({
        to: r.prospectName,
        subject: r.subject,
        service: r.serviceType,
        status: r.status,
        sentAt: r.sentAt,
      })),
    },
    deliveries,
  });
}

// POST — Trigger a manual engine cycle
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  if (body.action === 'start') {
    startEngine(body.intervalMs || 5 * 60 * 1000);
    return NextResponse.json({ message: 'Engine started' });
  }

  if (body.action === 'stop') {
    stopEngine();
    return NextResponse.json({ message: 'Engine stopped' });
  }

  // Default: run a single cycle
  const result = await runEngineCycle();
  return NextResponse.json(result);
}
