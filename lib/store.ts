import { create } from 'zustand';
import type { Agent, Revenue, Deal, Partnership, Offer } from '@/types';

interface DashboardState {
  // Revenue
  revenue: Revenue | null;
  updateRevenue: (revenue: Revenue) => void;

  // Agents
  agents: Agent[];
  updateAgents: (agents: Agent[]) => void;
  updateAgent: (id: string, agent: Partial<Agent>) => void;
  setAgentAutonomy: (id: string, level: number) => void;

  // Deals
  deals: Deal[];
  updateDeals: (deals: Deal[]) => void;

  // Partnerships
  partnerships: Partnership[];
  updatePartnerships: (partnerships: Partnership[]) => void;

  // Offers
  offers: Offer[];
  updateOffers: (offers: Offer[]) => void;

  // UI State
  selectedAgent: string | null;
  setSelectedAgent: (id: string | null) => void;
  timeframe: '1h' | '1d' | '7d' | '30d';
  setTimeframe: (tf: '1h' | '1d' | '7d' | '30d') => void;
  showDetailView: boolean;
  setShowDetailView: (show: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  revenue: null,
  updateRevenue: (revenue) => set({ revenue }),

  agents: [],
  updateAgents: (agents) => set({ agents }),
  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),
  setAgentAutonomy: (id, level) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, autonomyLevel: level } : a)),
    })),

  deals: [],
  updateDeals: (deals) => set({ deals }),

  partnerships: [],
  updatePartnerships: (partnerships) => set({ partnerships }),

  offers: [],
  updateOffers: (offers) => set({ offers }),

  selectedAgent: null,
  setSelectedAgent: (id) => set({ selectedAgent: id }),
  timeframe: '1h',
  setTimeframe: (tf) => set({ timeframe: tf }),
  showDetailView: false,
  setShowDetailView: (show) => set({ showDetailView: show }),
}));
