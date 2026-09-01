'use client';

import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Revenue } from '@/types';
import { chartColors } from '@/lib/colors';

interface OfferHeatmapProps {
  revenue: Revenue | null;
}

export function OfferHeatmap({ revenue }: OfferHeatmapProps) {
  if (!revenue) return null;

  const chartData = revenue.streams.map((stream) => ({
    name: stream.name.split(' ')[0],
    revenue: stream.hourlyActual,
    target: stream.hourlyTarget,
    margin: stream.margin,
    growth: stream.growthRate,
  }));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="glass-card p-6 rounded-lg border border-neon-green/30">
        <h3 className="text-lg font-bold text-neon-green mb-4">Offer Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 65, 0.1)" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1f3a',
                border: '1px solid #00ff41',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="revenue" fill={chartColors.revenue} radius={[8, 8, 0, 0]} />
            <Bar dataKey="target" fill={chartColors.target} radius={[8, 8, 0, 0]} opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-6 rounded-lg border border-neon-purple/30">
        <h3 className="text-lg font-bold text-neon-purple mb-4">Growth Trajectory</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(157, 78, 221, 0.1)" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1f3a',
                border: '1px solid #9d4edd',
                borderRadius: '8px',
              }}
            />
            <Line type="monotone" dataKey="growth" stroke={chartColors.profit} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}
