export const COLORS = {
  neon: {
    green: '#00ff41',
    red: '#ff006e',
    blue: '#00d9ff',
    purple: '#9d4edd',
    pink: '#ff006e',
  },
  dark: {
    bg: '#0a0e27',
    surface: '#1a1f3a',
    card: '#252d48',
  },
  status: {
    active: '#00ff41',
    hunting: '#00d9ff',
    closing: '#9d4edd',
    idle: '#666666',
    error: '#ff006e',
  },
} as const;

export const getStatusColor = (status: string): string => {
  return COLORS.status[status as keyof typeof COLORS.status] || COLORS.neon.green;
};

export const chartColors = {
  revenue: '#00ff41',
  target: '#00d9ff',
  deals: '#9d4edd',
  lost: '#ff006e',
  profit: '#00ff41',
};
