import { runProspectHunt, loadProspects, type Prospect } from './prospect-hunter';
import { runOutreach, runFollowUps, loadOutreachLog } from './outreach-engine';
import { processDeliveries, getDeliveryStats } from './service-delivery';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), '.revenue-engine');
const STATUS_FILE = join(DATA_DIR, 'engine-status.json');
const REVENUE_LOG = join(DATA_DIR, 'revenue.json');

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

interface EngineStatus {
  isRunning: boolean;
  lastHunt: string | null;
  lastOutreach: string | null;
  lastDeliveryCheck: string | null;
  totalCycles: number;
  uptime: string;
  startedAt: string;
  errors: string[];
}

interface RevenueEntry {
  id: string;
  type: 'prospect-found' | 'email-sent' | 'reply-received' | 'deal-closed' | 'delivery-complete';
  amount: number;
  details: string;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════
// ENGINE STATUS
// ═══════════════════════════════════════════════════════

function loadStatus(): EngineStatus {
  if (!existsSync(STATUS_FILE)) {
    return {
      isRunning: false,
      lastHunt: null,
      lastOutreach: null,
      lastDeliveryCheck: null,
      totalCycles: 0,
      uptime: '0h 0m',
      startedAt: new Date().toISOString(),
      errors: [],
    };
  }
  return JSON.parse(readFileSync(STATUS_FILE, 'utf-8'));
}

function saveStatus(status: EngineStatus) {
  writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
}

function logRevenue(type: RevenueEntry['type'], amount: number, details: string) {
  const log: RevenueEntry[] = existsSync(REVENUE_LOG)
    ? JSON.parse(readFileSync(REVENUE_LOG, 'utf-8'))
    : [];

  log.push({
    id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type,
    amount,
    details,
    timestamp: new Date().toISOString(),
  });

  writeFileSync(REVENUE_LOG, JSON.stringify(log.slice(-500), null, 2));
}

// ═══════════════════════════════════════════════════════
// MAIN ENGINE CYCLE
// One full cycle: hunt → outreach → deliver → report
// ═══════════════════════════════════════════════════════

export async function runEngineCycle(): Promise<{
  hunt: { found: number; total: number };
  outreach: { sent: number; queued: number; totalPipeline: number };
  deliveries: { processed: number; delivered: number };
  revenue: { total: number; today: number };
  status: EngineStatus;
}> {
  const status = loadStatus();
  status.isRunning = true;
  status.totalCycles++;
  status.errors = [];

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🔥 REVENUE ENGINE CYCLE #${status.totalCycles}`);
  console.log(`${'═'.repeat(60)}\n`);

  // ─── PHASE 1: HUNT PROSPECTS ───
  console.log('📡 Phase 1: Hunting for prospects...');
  let huntResult = { found: 0, total: 0, topProspects: [] as Prospect[] };
  try {
    huntResult = await runProspectHunt();
    status.lastHunt = new Date().toISOString();
    logRevenue('prospect-found', 0, `Found ${huntResult.found} new prospects`);
  } catch (e) {
    const msg = `Hunt error: ${(e as Error).message}`;
    console.error(`  ❌ ${msg}`);
    status.errors.push(msg);
  }

  // ─── PHASE 2: OUTREACH ───
  console.log('\n📧 Phase 2: Running outreach...');
  const prospects = loadProspects();
  let outreachResult = { sent: 0, queued: 0, totalSent: 0, totalPipeline: 0 };
  try {
    outreachResult = await runOutreach(prospects, 5);
    status.lastOutreach = new Date().toISOString();
    if (outreachResult.sent > 0) {
      logRevenue('email-sent', 0, `${outreachResult.sent} emails sent, $${outreachResult.totalPipeline} pipeline`);
    }
  } catch (e) {
    const msg = `Outreach error: ${(e as Error).message}`;
    console.error(`  ❌ ${msg}`);
    status.errors.push(msg);
  }

  // ─── PHASE 3: FOLLOW-UPS ───
  console.log('\n🔄 Phase 3: Running follow-ups...');
  try {
    const followUps = await runFollowUps(3);
    console.log(`  📋 ${followUps} follow-ups queued`);
  } catch (e) {
    console.error(`  ❌ Follow-up error: ${(e as Error).message}`);
  }

  // ─── PHASE 4: DELIVER ───
  console.log('\n📦 Phase 4: Processing deliveries...');
  let deliveryResult = { processed: 0, delivered: 0, inProgress: 0 };
  try {
    deliveryResult = await processDeliveries();
    status.lastDeliveryCheck = new Date().toISOString();
    if (deliveryResult.delivered > 0) {
      logRevenue('delivery-complete', 0, `${deliveryResult.delivered} deliveries completed`);
    }
  } catch (e) {
    const msg = `Delivery error: ${(e as Error).message}`;
    console.error(`  ❌ ${msg}`);
    status.errors.push(msg);
  }

  // ─── PHASE 5: REPORT ───
  console.log('\n📊 Phase 5: Generating report...');
  const deliveryStats = getDeliveryStats();
  const outreachLog = loadOutreachLog();
  const totalRevenue = deliveryStats.totalRevenue;

  // Calculate today's revenue
  const today = new Date().toISOString().split('T')[0];
  const revenueLog: RevenueEntry[] = existsSync(REVENUE_LOG)
    ? JSON.parse(readFileSync(REVENUE_LOG, 'utf-8'))
    : [];
  const todayRevenue = revenueLog
    .filter((r) => r.timestamp.startsWith(today))
    .reduce((sum, r) => sum + r.amount, 0);

  // Uptime calculation
  const startedAt = new Date(status.startedAt);
  const uptimeMs = Date.now() - startedAt.getTime();
  const uptimeHours = Math.floor(uptimeMs / (1000 * 60 * 60));
  const uptimeMinutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
  status.uptime = `${uptimeHours}h ${uptimeMinutes}m`;
  status.isRunning = false;
  saveStatus(status);

  // Print report
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📊 CYCLE #${status.totalCycles} COMPLETE`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`  🔍 Prospects found:  ${huntResult.found} new (total: ${huntResult.total})`);
  console.log(`  📧 Emails sent:     ${outreachResult.sent} (queued: ${outreachResult.queued})`);
  console.log(`  💰 Pipeline value:  $${outreachResult.totalPipeline.toLocaleString()}`);
  console.log(`  📦 Deliveries:      ${deliveryResult.delivered} completed`);
  console.log(`  💵 Total revenue:   $${totalRevenue.toLocaleString()}`);
  console.log(`  ⏱️  Uptime:          ${status.uptime}`);
  console.log(`  ❌ Errors:          ${status.errors.length}`);
  console.log(`${'─'.repeat(60)}\n`);

  return {
    hunt: { found: huntResult.found, total: huntResult.total },
    outreach: {
      sent: outreachResult.sent,
      queued: outreachResult.queued,
      totalPipeline: outreachResult.totalPipeline,
    },
    deliveries: {
      processed: deliveryResult.processed,
      delivered: deliveryResult.delivered,
    },
    revenue: { total: totalRevenue, today: todayRevenue },
    status,
  };
}

// ═══════════════════════════════════════════════════════
// AUTO-START
// Begins the engine loop on import
// ═══════════════════════════════════════════════════════

let engineInterval: ReturnType<typeof setInterval> | null = null;

export function startEngine(intervalMs: number = 5 * 60 * 1000) {
  if (engineInterval) return; // Already running

  const status = loadStatus();
  status.isRunning = true;
  status.startedAt = new Date().toISOString();
  saveStatus(status);

  console.log('🚀 REVENUE ENGINE STARTED');
  console.log(`   Cycle interval: ${intervalMs / 1000}s`);

  // Run first cycle immediately
  runEngineCycle().catch(console.error);

  // Then run on interval
  engineInterval = setInterval(() => {
    runEngineCycle().catch(console.error);
  }, intervalMs);
}

export function stopEngine() {
  if (engineInterval) {
    clearInterval(engineInterval);
    engineInterval = null;
  }
  const status = loadStatus();
  status.isRunning = false;
  saveStatus(status);
  console.log('⏹️  Revenue engine stopped');
}

export function getEngineStatus(): EngineStatus {
  return loadStatus();
}
