'use client';

import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { Revenue } from '@/types';

interface OfferHeatmapProps {
  revenue: Revenue | null;
}

const BAR_COLORS = ['#00ff41', '#00d9ff', '#9d4edd', '#ff006e', '#00ff41'];

export function OfferHeatmap({ revenue }: OfferHeatmapProps) {
  if (!revenue) return null;

  const barData = revenue.streams.map((stream, i) => ({
    name: stream.name.split(' ')[0],
    actual: stream.hourlyActual,
    target: stream.hourlyTarget,
    fill: BAR_COLORS[i % BAR_COLORS.length],
  }));

  const areaData = revenue.streams.map((stream, i) => ({
    name: stream.name.split(' ')[0],
    growth: stream.growthRate,
    margin: stream.margin,
    conversion: stream.conversionRate,
  }));

  const tooltipStyle = {
    backgroundColor: '#1a1f3a',
    border: '1px solid #00ff41',
    borderRadius: '8px',
    fontSize: '11px',
    color: '#e0e0e0',
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Revenue vs Target Bar Chart */}
      <motion.div variants={itemVariants} className="glass-card p-5 rounded-xl border border-neon-green/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-neon-green">Offer Performance</h3>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green font-semibold">
            LIVE
          </span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 65, 0.06)" />
            <XAxis
              dataKey="name"
              stroke="#555"
              tick={{ fontSize: 10, fill: '#888' }}
            />
            <YAxis
              stroke="#555"
              tick={{ fontSize: 10, fill: '#888' }}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="actual" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.9} />
              ))}
            </Bar>
            <Bar dataKey="target" fill="rgba(255,255,255,0.08)" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Growth Trajectory Area Chart */}
      <motion.div variants={itemVariants} className="glass-card p-5 rounded-xl border border-neon-purple/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-neon-purple">Growth Trajectory</h3>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-neon-purple/10 text-neon-purple font-semibold">
            TRENDING
          </span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={areaData}>
            <defs>
              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff41" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00ff41" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(157, 78, 221, 0.06)" />
            <XAxis dataKey="name" stroke="#555" tick={{ fontSize: 10, fill: '#888' }} />
            <YAxis stroke="#555" tick={{ fontSize: 10, fill: '#888' }} />
            <Tooltip contentStyle={{ ...tooltipStyle, borderColor: '#9d4edd' }} />
            <Area
              type="monotone"
              dataKey="growth"
              stroke="#00ff41"
              strokeWidth={2}
              fill="url(#growthGradient)"
              dot={{ fill: '#00ff41', r: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Margin Heatmap */}
      <motion.div variants={itemVariants} className="glass-card p-5 rounded-xl border border-neon-blue/20">
        <h3 className="text-sm font-bold text-neon-blue mb-4">Margin Analysis</h3>
        <div className="grid grid-cols-5 gap-2">
          {revenue.streams.map((stream, i) => (
            <div key={stream.id} className="text-center">
              <div
                className="w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold mb-1"
                style={{
                  backgroundColor: `rgba(0, 255, 65, ${stream.margin / 100 * 0.4})`,
                  border: `1px solid rgba(0, 255, 65, ${stream.margin / 100 * 0.6})`,
                  boxShadow: stream.margin > 80
                    ? '0 0 10px rgba(0, 255, 65, 0.2)'
                    : undefined,
                }}
              >
                <span className="text-neon-green">{stream.margin}%</span>
              </div>
              <p className="text-[8px] text-os-dim truncate">{stream.name.split(' ')[0]}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
