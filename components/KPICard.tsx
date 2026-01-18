'use client';

import { ReactNode } from 'react';
import { classNames } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'income' | 'expense';
}

export default function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
}: KPICardProps) {
  const iconColors = {
    default: 'bg-indigo-100 text-indigo-600',
    income: 'bg-green-100 text-green-600',
    expense: 'bg-red-100 text-red-600',
  };

  const valueColors = {
    default: 'text-slate-900',
    income: 'text-green-600',
    expense: 'text-red-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className={classNames('mt-1 text-2xl font-semibold', valueColors[variant])}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {trend.value >= 0 ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              )}
              <span
                className={classNames(
                  'text-sm font-medium',
                  trend.value >= 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-slate-500">{trend.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={classNames(
              'flex h-12 w-12 items-center justify-center rounded-lg',
              iconColors[variant]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
