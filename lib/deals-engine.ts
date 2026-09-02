import type { Deal } from '@/types';

const FIRST_NAMES = [
  'TechCorp', 'Quantum', 'Nexus', 'Vertex', 'Pulse', 'Cipher', 'Titan',
  'Apex', 'Forge', 'Zenith', 'Helix', 'Nova', 'Aether', 'Prism', 'Echo',
];

const LAST_NAMES = [
  'Inc', 'Solutions', 'Labs', 'Ventures', 'Group', 'Partners', 'Co',
  'Technologies', 'Digital', 'Enterprises', 'Global', 'Systems', 'AI',
];

const OFFERS = [
  'High-Ticket Consulting',
  'Digital Product Bundle',
  'Partnership Deal',
  'Coaching Program',
  'Membership Access',
  'Done-For-You Service',
  'Affiliate Package',
  'Strategic Alliance',
  'White-Label License',
  'Premium Masterclass',
];

const STAGES: Deal['stage'][] = ['prospect', 'engaged', 'negotiating', 'closed', 'completed'];

let dealCounter = 0;

export function generateDeal(): Deal {
  dealCounter++;
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const stage = STAGES[Math.floor(Math.random() * 3)]; // Don't auto-generate closed deals
  const value = [500, 1000, 2500, 5000, 10000, 25000, 50000][Math.floor(Math.random() * 7)];

  return {
    id: `deal-${Date.now()}-${dealCounter}`,
    agentId: `agent-${Math.floor(1 + Math.random() * 8)}`,
    prospect: `${firstName} ${lastName}`,
    offer: OFFERS[Math.floor(Math.random() * OFFERS.length)],
    value,
    stage,
    status: 'active',
    probability: Math.floor(20 + Math.random() * 70),
    timeInStage: Math.random() * 4,
    createdAt: new Date().toISOString(),
  };
}

export function generateInitialDeals(): Deal[] {
  return [
    {
      id: 'deal-1',
      agentId: 'agent-1',
      prospect: 'TechCorp Inc',
      offer: 'High-Ticket Consulting',
      value: 25000,
      stage: 'negotiating',
      status: 'active',
      probability: 85,
      timeInStage: 2,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'deal-2',
      agentId: 'agent-2',
      prospect: 'StartupXYZ',
      offer: 'Digital Product Bundle',
      value: 5000,
      stage: 'closed',
      status: 'won',
      probability: 100,
      timeInStage: 0.5,
      createdAt: new Date().toISOString(),
      closedAt: new Date().toISOString(),
    },
    {
      id: 'deal-3',
      agentId: 'agent-4',
      prospect: 'Enterprise Solutions',
      offer: 'Partnership Deal',
      value: 50000,
      stage: 'engaged',
      status: 'active',
      probability: 65,
      timeInStage: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'deal-4',
      agentId: 'agent-3',
      prospect: 'Quantum Labs',
      offer: 'Affiliate Package',
      value: 10000,
      stage: 'prospect',
      status: 'active',
      probability: 40,
      timeInStage: 0.2,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'deal-5',
      agentId: 'agent-1',
      prospect: 'Nova Ventures',
      offer: 'Coaching Program',
      value: 15000,
      stage: 'negotiating',
      status: 'active',
      probability: 72,
      timeInStage: 1.5,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'deal-6',
      agentId: 'agent-6',
      prospect: 'Aether Group',
      offer: 'Membership Access',
      value: 3500,
      stage: 'closed',
      status: 'won',
      probability: 100,
      timeInStage: 0,
      createdAt: new Date().toISOString(),
      closedAt: new Date().toISOString(),
    },
  ];
}

export function advanceDeal(deal: Deal): Partial<Deal> {
  const stageOrder: Deal['stage'][] = ['prospect', 'engaged', 'negotiating', 'closed', 'completed'];
  const currentIndex = stageOrder.indexOf(deal.stage);

  if (currentIndex < 3) {
    const won = Math.random() < 0.6;
    if (won && currentIndex === 2) {
      return {
        stage: 'closed',
        status: 'won',
        probability: 100,
        closedAt: new Date().toISOString(),
      };
    } else if (!won && Math.random() < 0.2) {
      return {
        stage: deal.stage,
        status: 'lost',
        probability: 0,
      };
    }
    return {
      stage: stageOrder[currentIndex + 1],
      probability: Math.min(100, deal.probability + Math.floor(Math.random() * 15)),
    };
  }

  return {};
}
