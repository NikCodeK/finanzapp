'use client';

import { formatCurrency } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  byType: Record<string, { value: number; count: number; gainLoss: number }>;
  investmentCount: number;
}

interface PortfolioOverviewProps {
  metrics: PortfolioMetrics;
}

const TYPE_LABELS: Record<string, string> = {
  aktie: 'Aktien',
  etf: 'ETFs',
  krypto: 'Krypto',
  fond: 'Fonds',
  anleihe: 'Anleihen',
  sonstiges: 'Sonstiges',
};

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function PortfolioOverview({ metrics }: PortfolioOverviewProps) {
  const pieData = Object.entries(metrics.byType).map(([type, data]) => ({
    name: TYPE_LABELS[type] || type,
    value: data.value,
    count: data.count,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-500">Portfolio-Wert</p>
          <p className="text-2xl font-bold text-slate-900">
            {formatCurrency(metrics.totalValue)}
          </p>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-500">Investiert</p>
          <p className="text-2xl font-bold text-slate-900">
            {formatCurrency(metrics.totalCost)}
          </p>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-500">Gewinn/Verlust</p>
          <p
            className={`text-2xl font-bold ${
              metrics.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {metrics.totalGainLoss >= 0 ? '+' : ''}
            {formatCurrency(metrics.totalGainLoss)}
          </p>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-500">Performance</p>
          <p
            className={`text-2xl font-bold ${
              metrics.totalGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {metrics.totalGainLossPercent >= 0 ? '+' : ''}
            {metrics.totalGainLossPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Portfolio Allocation Chart */}
      {pieData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-slate-900">Aufteilung nach Typ</h4>
            {Object.entries(metrics.byType)
              .sort((a, b) => b[1].value - a[1].value)
              .map(([type, data], index) => {
                const percentage =
                  metrics.totalValue > 0 ? (data.value / metrics.totalValue) * 100 : 0;
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">
                          {TYPE_LABELS[type] || type}
                        </span>
                        <span className="text-sm font-medium text-slate-900">
                          {formatCurrency(data.value)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>{data.count} Position(en)</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {pieData.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          Keine aktiven Investments vorhanden
        </div>
      )}
    </div>
  );
}
