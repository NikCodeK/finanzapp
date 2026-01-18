'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { ProjectionMonth } from '@/lib/types';

interface ProjectionLineProps {
  base: ProjectionMonth[];
  best: ProjectionMonth[];
  worst: ProjectionMonth[];
  showAllScenarios?: boolean;
}

export default function ProjectionLine({
  base,
  best,
  worst,
  showAllScenarios = true,
}: ProjectionLineProps) {
  // Merge data for multi-line chart
  const data = base.map((item, index) => ({
    month: item.month,
    base: item.cumulativeCash,
    best: best[index]?.cumulativeCash ?? 0,
    worst: worst[index]?.cumulativeCash ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="month"
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#e2e8f0' }}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          formatter={(value: number, name: string) => [
            formatCurrency(value),
            name === 'base'
              ? 'Basis'
              : name === 'best'
              ? 'Best Case'
              : 'Worst Case',
          ]}
        />
        <Legend
          formatter={(value) =>
            value === 'base'
              ? 'Basis'
              : value === 'best'
              ? 'Best Case'
              : 'Worst Case'
          }
        />
        <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="base"
          stroke="#6366f1"
          strokeWidth={3}
          dot={{ fill: '#6366f1', r: 3 }}
        />
        {showAllScenarios && (
          <>
            <Line
              type="monotone"
              dataKey="best"
              stroke="#22c55e"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#22c55e', r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="worst"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#ef4444', r: 2 }}
            />
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
