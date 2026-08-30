export interface Partnership {
  id: string;
  name: string;
  type: 'affiliate' | 'referral' | 'strategic' | 'revenue-share';
  commissionRate: number; // 0-100%
  monthlyTarget: number;
  monthlyActual: number;
  roi: number; // 0-1000%
  status: 'active' | 'pending' | 'paused' | 'completed';
  leadsGenerated: number;
  revenue: number;
  costPerLead: number;
  quality: number; // 0-100
}

export interface PartnershipNetwork {
  totalPartners: number;
  activePartners: number;
  totalPartnerRevenue: number;
  avgPartnerROI: number;
  partners: Partnership[];
}
