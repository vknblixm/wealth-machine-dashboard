export type OfferType = 'digital-product' | 'coaching' | 'service' | 'membership' | 'bundle';

export interface Offer {
  id: string;
  name: string;
  type: OfferType;
  description: string;
  price: number;
  costToDeliver: number;
  margin: number;
  salesThisHour: number;
  conversionRate: number;
  avgOrderValue: number;
  roi: number;
  isHot: boolean;
  daysLive: number;
}

export interface OfferPerformance {
  offerId: string;
  conversions: number;
  impressions: number;
  conversionRate: number;
  revenue: number;
  roi: number;
  trend: 'up' | 'down' | 'stable';
}
