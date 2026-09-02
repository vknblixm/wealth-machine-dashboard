export type AgentStatus = 'active' | 'idle' | 'hunting' | 'closing' | 'error';
export type AgentType =
  | 'closer'
  | 'offer-engineer'
  | 'traffic-gunner'
  | 'partner-predator'
  | 'product-machine'
  | 'community-operator'
  | 'money-optimizer'
  | 'growth-hacker';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  autonomyLevel: number; // 0-100
  dailyTarget: number; // $
  dailyActual: number; // $
  conversionRate: number; // 0-100
  lastActive: string; // ISO timestamp
  dealsThisHour: number;
  totalRevenue: number;
  efficiency: number; // 0-100
  aggressiveness: number; // 0-100 (how hard it hunts)
}

export interface AgentMetrics {
  agentId: string;
  timestamp: string;
  revenueGenerated: number;
  dealsAttempted: number;
  dealsCompleted: number;
  conversionRate: number;
  avgDealSize: number;
  timeToClose: number; // minutes
  customerSatisfaction: number; // 0-100
}
