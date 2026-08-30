import type { Revenue, RevenueStream } from '@/types';

// Simulated revenue data generator
export function generateRevenueData(): Revenue {
  const now = new Date().toISOString();
  
  // Base multiplier (increases over time to show exponential growth)
  const timeMultiplier = 1 + (Date.now() / (1000 * 60 * 60)) * 0.1; // +10% per hour
  
  const streams: RevenueStream[] = [
    {
      id: 'stream-1',
      name: 'High-Ticket Consulting',
      type: 'consulting',
      hourlyTarget: 2500,
      hourlyActual: Math.floor(2500 * (0.8 + Math.random() * 0.4) * timeMultiplier),
      dailyTarget: 30000,
      dailyActual: Math.floor(30000 * (0.7 + Math.random() * 0.5) * timeMultiplier),
      monthlyProjection: 750000,
      conversionRate: 35 + Math.random() * 15,
      avgCustomerValue: 5000,
      status: 'scaling',
      margin: 85,
      growthRate: 12 + Math.random() * 8,
    },
    {
      id: 'stream-2',
      name: 'Digital Products',
      type: 'digital-product',
      hourlyTarget: 1200,
      hourlyActual: Math.floor(1200 * (0.9 + Math.random() * 0.3) * timeMultiplier),
      dailyTarget: 15000,
      dailyActual: Math.floor(15000 * (0.8 + Math.random() * 0.4) * timeMultiplier),
      monthlyProjection: 350000,
      conversionRate: 22 + Math.random() * 10,
      avgCustomerValue: 297,
      status: 'active',
      margin: 92,
      growthRate: 8 + Math.random() * 6,
    },
    {
      id: 'stream-3',
      name: 'Affiliate Partnerships',
      type: 'affiliate',
      hourlyTarget: 800,
      hourlyActual: Math.floor(800 * (0.7 + Math.random() * 0.5) * timeMultiplier),
      dailyTarget: 10000,
      dailyActual: Math.floor(10000 * (0.6 + Math.random() * 0.6) * timeMultiplier),
      monthlyProjection: 200000,
      conversionRate: 18 + Math.random() * 12,
      avgCustomerValue: 450,
      status: 'active',
      margin: 35,
      growthRate: 15 + Math.random() * 10,
    },
    {
      id: 'stream-4',
      name: 'Membership Community',
      type: 'membership',
      hourlyTarget: 500,
      hourlyActual: Math.floor(500 * (0.9 + Math.random() * 0.2) * timeMultiplier),
      dailyTarget: 8000,
      dailyActual: Math.floor(8000 * (0.85 + Math.random() * 0.25) * timeMultiplier),
      monthlyProjection: 180000,
      conversionRate: 28 + Math.random() * 12,
      avgCustomerValue: 397,
      status: 'scaling',
      margin: 88,
      growthRate: 20 + Math.random() * 12,
    },
  ];

  const totalToday = streams.reduce((sum, s) => sum + s.dailyActual, 0);
  const totalThisHour = streams.reduce((sum, s) => sum + s.hourlyActual, 0);

  return {
    totalToday,
    totalThisHour,
    totalThisMonth: totalToday * 30,
    totalAllTime: totalToday * 30 + Math.random() * 100000,
    streams,
    lastUpdated: now,
    isGrowing: true,
    growthRate: 18 + Math.random() * 12,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function calculateGrowthPercentage(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}
