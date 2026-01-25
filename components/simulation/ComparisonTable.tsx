'use client';

import { classNames, formatCurrency, formatPercentInt } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/solid';

interface ComparisonRow {
  label: string;
  current: number;
  simulated: number;
  isPercentage?: boolean;
  invertColors?: boolean; // For costs where lower is better
}

interface ComparisonTableProps {
  rows: ComparisonRow[];
}

function DiffIndicator({
  diff,
  isPercentage = false,
  invertColors = false,
}: {
  diff: number;
  isPercentage?: boolean;
  invertColors?: boolean;
}) {
  if (Math.abs(diff) < 0.01) {
    return (
      <span className="flex items-center gap-1 text-slate-500">
        <MinusIcon className="h-4 w-4" />
        <span>0</span>
      </span>
    );
  }

  const isPositive = diff > 0;
  const isGood = invertColors ? !isPositive : isPositive;

  return (
    <span
      className={classNames(
        'flex items-center gap-1 font-medium',
        isGood ? 'text-emerald-600' : 'text-red-600'
      )}
    >
      {isPositive ? (
        <ArrowUpIcon className="h-4 w-4" />
      ) : (
        <ArrowDownIcon className="h-4 w-4" />
      )}
      <span>
        {isPositive ? '+' : ''}
        {isPercentage ? formatPercentInt(diff) : formatCurrency(diff)}
      </span>
    </span>
  );
}

export default function ComparisonTable({ rows }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-500" />
            <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">
              Aktuell
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-indigo-600">
              Simuliert
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">
              Differenz
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => {
            const diff = row.simulated - row.current;
            return (
              <tr key={index} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {row.label}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 text-right">
                  {row.isPercentage
                    ? formatPercentInt(row.current)
                    : formatCurrency(row.current)}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-indigo-600 text-right">
                  {row.isPercentage
                    ? formatPercentInt(row.simulated)
                    : formatCurrency(row.simulated)}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <DiffIndicator
                    diff={diff}
                    isPercentage={row.isPercentage}
                    invertColors={row.invertColors}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Simple KPI cards for quick stats
interface KPICardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'red';
}

export function KPICard({
  label,
  value,
  subtext,
  trend,
  trendValue,
  color = 'indigo',
}: KPICardProps) {
  const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-red-600',
    neutral: 'text-slate-500',
  };

  return (
    <div className={classNames('rounded-xl p-4', colorStyles[color])}>
      <p className="text-xs uppercase tracking-wide opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {(subtext || trendValue) && (
        <div className="flex items-center gap-2 mt-1">
          {trendValue && trend && (
            <span className={classNames('text-sm font-medium', trendColors[trend])}>
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {trendValue}
            </span>
          )}
          {subtext && <span className="text-xs opacity-75">{subtext}</span>}
        </div>
      )}
    </div>
  );
}
