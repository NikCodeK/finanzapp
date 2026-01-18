'use client';

import { formatCurrency, formatPercentInt } from '@/lib/utils';
import { IncomeMilestone } from '@/lib/types';

interface GoalProgressBarProps {
  currentAmount: number;
  targetAmount: number;
  startAmount: number;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  milestones?: IncomeMilestone[];
}

export default function GoalProgressBar({
  currentAmount,
  targetAmount,
  startAmount,
  showLabels = true,
  size = 'md',
  milestones,
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

  // Calculate milestone positions as percentages
  const milestonePositions = milestones?.map(m => ({
    ...m,
    position: range > 0 ? ((m.targetAmount - startAmount) / range) * 100 : 0,
    isReached: currentAmount >= m.targetAmount,
  })) || [];

  return (
    <div className="w-full">
      <div className={`relative w-full bg-slate-200 rounded-full ${heightClasses[size]}`}>
        <div
          className={`${getColorClass()} ${heightClasses[size]} rounded-full transition-all duration-500`}
          style={{ width: `${progressPercent * 100}%` }}
        />
        {/* Milestone markers */}
        {milestonePositions.map((m, index) => (
          <div
            key={m.id}
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: `${Math.min(m.position, 100)}%` }}
          >
            <div
              className={`w-2 h-2 rounded-full border-2 ${
                m.isReached
                  ? 'bg-emerald-500 border-emerald-600'
                  : 'bg-white border-slate-400'
              }`}
              title={`${m.name || `Meilenstein ${index + 1}`}: ${formatCurrency(m.targetAmount)}`}
            />
          </div>
        ))}
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
