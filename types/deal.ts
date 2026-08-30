export type DealStage = 'prospect' | 'engaged' | 'negotiating' | 'closed' | 'completed';
export type DealStatus = 'active' | 'won' | 'lost';

export interface Deal {
  id: string;
  agentId: string;
  prospect: string;
  offer: string;
  value: number;
  stage: DealStage;
  status: DealStatus;
  probability: number; // 0-100
  timeInStage: number; // hours
  createdAt: string;
  closedAt?: string;
}

export interface DealMetrics {
  totalDeals: number;
  activeDeals: number;
  wonDeals: number;
  lostDeals: number;
  winRate: number; // 0-100
  avgDealSize: number;
  avgTimeToClose: number; // hours
  pipelineValue: number;
}
