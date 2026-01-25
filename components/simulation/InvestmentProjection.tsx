'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency, classNames } from '@/lib/utils';

interface InvestmentMonth {
  month: number;
  year: number;
  label: string;
  contributions: number;
  portfolioValue: number;
  returns: number;
}

interface InvestmentProjectionProps {
  data: InvestmentMonth[];
  expectedReturn: number;
  savingsRate: number;
  timeHorizon: number;
  onReturnChange: (value: number) => void;
  onSavingsRateChange: (value: number) => void;
  onTimeHorizonChange: (value: number) => void;
  monthlyContribution: number;
  finalValue: number;
  totalContributions: number;
  totalReturns: number;
  fireTarget: number;
  yearsToFire: number | null;
}

const TIME_HORIZONS = [5, 10, 15, 20, 25, 30];

export default function InvestmentProjection({
  data,
  expectedReturn,
  savingsRate,
  timeHorizon,
  onReturnChange,
  onSavingsRateChange,
  onTimeHorizonChange,
  monthlyContribution,
  finalValue,
  totalContributions,
  totalReturns,
  fireTarget,
  yearsToFire,
}: InvestmentProjectionProps) {
  // Sample data points for chart (show every 12th month for cleaner display)
  const chartData = data.filter((_, index) => index % 12 === 0 || index === data.length - 1);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Expected Return */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Erwartete Rendite</span>
            <span className="font-semibold text-indigo-600">
              {(expectedReturn * 100).toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min={0.01}
            max={0.15}
            step={0.005}
            value={expectedReturn}
            onChange={(e) => onReturnChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>1%</span>
            <span>15%</span>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Sparrate (vom Verfügbaren)</span>
            <span className="font-semibold text-emerald-600">
              {(savingsRate * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={savingsRate}
            onChange={(e) => onSavingsRateChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Time Horizon */}
        <div className="space-y-2">
          <span className="text-sm text-slate-600">Zeithorizont</span>
          <div className="flex flex-wrap gap-2">
            {TIME_HORIZONS.map((years) => (
              <button
                key={years}
                onClick={() => onTimeHorizonChange(years)}
                className={classNames(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  timeHorizon === years
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {years}J
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Contribution Info */}
      <div className="bg-indigo-50 rounded-lg p-4">
        <p className="text-sm text-indigo-600">
          Monatliche Sparrate:{' '}
          <span className="font-bold text-lg">{formatCurrency(monthlyContribution)}</span>
        </p>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#e2e8f0' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(value) =>
                value >= 1000000
                  ? `${(value / 1000000).toFixed(1)}M`
                  : `${(value / 1000).toFixed(0)}k`
              }
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
                name === 'portfolioValue'
                  ? 'Gesamtwert'
                  : name === 'contributions'
                  ? 'Einzahlungen'
                  : 'Rendite',
              ]}
            />
            <Legend
              formatter={(value) =>
                value === 'portfolioValue'
                  ? 'Gesamtwert'
                  : value === 'contributions'
                  ? 'Einzahlungen'
                  : 'Rendite'
              }
            />
            <Area
              type="monotone"
              dataKey="contributions"
              stackId="1"
              stroke="#6366f1"
              fill="url(#colorContributions)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="returns"
              stackId="1"
              stroke="#22c55e"
              fill="url(#colorReturns)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-xs text-slate-500 uppercase">Einzahlungen</p>
          <p className="text-xl font-bold text-slate-700">{formatCurrency(totalContributions)}</p>
          <p className="text-xs text-slate-400">über {timeHorizon} Jahre</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4">
          <p className="text-xs text-emerald-600 uppercase">Rendite</p>
          <p className="text-xl font-bold text-emerald-700">{formatCurrency(totalReturns)}</p>
          <p className="text-xs text-emerald-500">
            {totalContributions > 0
              ? `+${((totalReturns / totalContributions) * 100).toFixed(0)}%`
              : '0%'}
          </p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-xs text-indigo-600 uppercase">Endwert</p>
          <p className="text-xl font-bold text-indigo-700">{formatCurrency(finalValue)}</p>
          <p className="text-xs text-indigo-500">nach {timeHorizon} Jahren</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4">
          <p className="text-xs text-amber-600 uppercase">FIRE Ziel</p>
          <p className="text-xl font-bold text-amber-700">
            {yearsToFire !== null ? `${yearsToFire.toFixed(1)} Jahre` : '-'}
          </p>
          <p className="text-xs text-amber-500">
            Ziel: {formatCurrency(fireTarget)}
          </p>
        </div>
      </div>

      {/* FIRE Progress */}
      {yearsToFire !== null && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-amber-800">
              Weg zur finanziellen Unabhängigkeit
            </span>
            <span className="text-sm text-amber-600">
              {((finalValue / fireTarget) * 100).toFixed(0)}% in {timeHorizon} Jahren
            </span>
          </div>
          <div className="h-3 bg-amber-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (finalValue / fireTarget) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-amber-600 mt-2">
            {finalValue >= fireTarget
              ? '🎉 FIRE-Ziel erreicht!'
              : yearsToFire <= timeHorizon
              ? `FIRE erreichbar in ${yearsToFire.toFixed(1)} Jahren`
              : `Noch ${formatCurrency(fireTarget - finalValue)} bis zum Ziel`}
          </p>
        </div>
      )}
    </div>
  );
}
