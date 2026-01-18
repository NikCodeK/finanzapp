'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface NetWorthLineProps {
  data: { month: string; netWorth: number }[];
}

export default function NetWorthLine({ data }: NetWorthLineProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
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
          formatter={(value: number) => formatCurrency(value)}
          labelFormatter={(label) => `Monat: ${label}`}
        />
        <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="netWorth"
          name="Nettovermögen"
          stroke="#6366f1"
          strokeWidth={3}
          dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#4f46e5' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
