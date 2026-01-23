'use client';

import { SpendingPattern } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SpendingPatternsProps {
  patterns: SpendingPattern[];
  peakDay: SpendingPattern;
}

export default function SpendingPatterns({ patterns, peakDay }: SpendingPatternsProps) {
  const chartData = useMemo(() => {
    return patterns.map((pattern) => ({
      day: pattern.dayName.substring(0, 2),
      amount: pattern.totalAmount,
      count: pattern.transactionCount,
      fullDay: pattern.dayName,
    }));
  }, [patterns]);

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => {
                const match = chartData.find((item) => item.day === label);
                return match?.fullDay || label;
              }}
              contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Peak Day Highlight */}
      <div className="p-4 bg-indigo-50 rounded-lg">
        <p className="text-sm text-indigo-600">Höchste Ausgaben</p>
        <p className="text-xl font-bold text-indigo-900">{peakDay.dayName}</p>
        <p className="text-sm text-indigo-600">
          {formatCurrency(peakDay.totalAmount)} ({peakDay.transactionCount} Transaktionen)
        </p>
      </div>

      {/* Daily Stats */}
      <div className="grid grid-cols-7 gap-2">
        {patterns.map((pattern) => (
          <div
            key={pattern.dayOfWeek}
            className={`p-2 rounded text-center ${
              pattern.dayOfWeek === peakDay.dayOfWeek
                ? 'bg-indigo-100 border-2 border-indigo-300'
                : 'bg-slate-50'
            }`}
          >
            <p className="text-xs font-medium text-slate-600">
              {pattern.dayName.substring(0, 2)}
            </p>
            <p className="text-sm font-bold text-slate-900">
              {pattern.transactionCount}
            </p>
            <p className="text-xs text-slate-500">
              {formatCurrency(pattern.averageAmount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
