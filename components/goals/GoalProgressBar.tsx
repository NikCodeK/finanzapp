'use client';

import { formatCurrency, formatPercentInt } from '@/lib/utils';

interface GoalProgressBarProps {
  currentAmount: number;
  targetAmount: number;
  startAmount: number;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function GoalProgressBar({
  currentAmount,
  targetAmount,
  startAmount,
  showLabels = true,
  size = 'md',
}: GoalProgressBarProps) {
  const range = targetAmount - startAmount;
  const progress = range > 0 ? (currentAmount - startAmount) / range : 0;
  const progressPercent = Math.min(Math.max(progress, 0), 1);

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const getColorClass = () => {
    if (progressPercent >= 1) return 'bg-emerald-500';
    if (progressPercent >= 0.75) return 'bg-green-500';
    if (progressPercent >= 0.5) return 'bg-yellow-500';
    if (progressPercent >= 0.25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-slate-200 rounded-full ${heightClasses[size]}`}>
        <div
          className={`${getColorClass()} ${heightClasses[size]} rounded-full transition-all duration-500`}
          style={{ width: `${progressPercent * 100}%` }}
        />
      </div>
      {showLabels && (
        <div className="flex justify-between mt-1 text-xs text-slate-500">
          <span>{formatCurrency(currentAmount)}</span>
          <span>{formatPercentInt(progressPercent)}</span>
          <span>{formatCurrency(targetAmount)}</span>
        </div>
      )}
    </div>
  );
}
