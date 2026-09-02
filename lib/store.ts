import { create } from 'zustand';
import type { Agent, Revenue, Deal, Partnership, Offer } from '@/types';

interface DashboardState {
  revenue: Revenue | null;
  updateRevenue: (revenue: Revenue) => void;

  agents: Agent[];
  updateAgents: (agents: Agent[]) => void;
  updateAgent: (id: string, agent: Partial<Agent>) => void;
  setAgentAutonomy: (id: string, level: number) => void;

  deals: Deal[];
  updateDeals: (deals: Deal[]) => void;
  addDeal: (deal: Deal) => void;

  partnerships: Partnership[];
  updatePartnerships: (partnerships: Partnership[]) => void;

  offers: Offer[];
  updateOffers: (offers: Offer[]) => void;

  selectedAgent: string | null;
  setSelectedAgent: (id: string | null) => void;
  timeframe: '1h' | '1d' | '7d' | '30d';
  setTimeframe: (tf: '1h' | '1d' | '7d' | '30d') => void;
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
  addDeal: (deal) =>
    set((state) => ({
      deals: [deal, ...state.deals].slice(0, 20),
    })),

  partnerships: [],
  updatePartnerships: (partnerships) => set({ partnerships }),

  offers: [],
  updateOffers: (offers) => set({ offers }),

  selectedAgent: null,
  setSelectedAgent: (id) => set({ selectedAgent: id }),
  timeframe: '1h',
  setTimeframe: (tf) => set({ timeframe: tf }),
}));
