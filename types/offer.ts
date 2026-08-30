export type OfferType = 'digital-product' | 'coaching' | 'service' | 'membership' | 'bundle';

export interface Offer {
  id: string;
  name: string;
  type: OfferType;
  description: string;
  price: number;
  costToDeliver: number;
  margin: number; // calculated
  salesThisHour: number;
  conversionRate: number;
  avgOrderValue: number;
  roi: number;
  isHot: boolean; // trending/converting well
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
