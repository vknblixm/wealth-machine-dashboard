export type RevenueStreamType =
  | 'consulting'
  | 'digital-product'
  | 'affiliate'
  | 'high-ticket'
  | 'coaching'
  | 'membership'
  | 'service'
  | 'partnership'
  | 'arbitrage';

export interface RevenueStream {
  id: string;
  name: string;
  type: RevenueStreamType;
  hourlyTarget: number;
  hourlyActual: number;
  dailyTarget: number;
  dailyActual: number;
  monthlyProjection: number;
  conversionRate: number;
  avgCustomerValue: number;
  status: 'active' | 'pilot' | 'scaling' | 'paused' | 'dead';
  margin: number; // 0-100%
  growthRate: number; // % daily
}

export interface Revenue {
  totalToday: number;
  totalThisHour: number;
  totalThisMonth: number;
  totalAllTime: number;
  streams: RevenueStream[];
  lastUpdated: string;
  isGrowing: boolean;
  growthRate: number; // % per hour
}

export interface RevenueForecast {
  nextHour: number;
  nextDay: number;
  nextWeek: number;
  nextMonth: number;
  next90Days: number;
}
