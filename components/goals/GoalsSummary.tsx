'use client';

import { Goal } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { CheckCircleIcon, ClockIcon, FlagIcon } from '@heroicons/react/24/outline';

interface GoalsSummaryProps {
  goals: Goal[];
  getGoalProgress: (goal: Goal) => number;
}

export default function GoalsSummary({ goals, getGoalProgress }: GoalsSummaryProps) {
  const activeGoals = goals.filter((g) => g.status === 'aktiv');
  const achievedGoals = goals.filter((g) => g.status === 'erreicht');
  const pausedGoals = goals.filter((g) => g.status === 'pausiert');

  const totalTarget = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrent = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalRemaining = totalTarget - totalCurrent;

  const goalsOnTrack = activeGoals.filter((goal) => {
    const now = new Date();
    const deadline = new Date(goal.deadlineISO);
    const created = new Date(goal.createdAtISO);
    const totalDays = (deadline.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    const daysPassed = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    const expectedProgress = daysPassed / totalDays;
    const actualProgress = getGoalProgress(goal);
    return actualProgress >= expectedProgress * 0.9;
  }).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
        <div className="flex items-center gap-2 mb-2">
          <FlagIcon className="h-5 w-5 text-indigo-600" />
          <p className="text-sm font-medium text-indigo-600">Aktive Ziele</p>
        </div>
        <p className="text-2xl font-bold text-indigo-700">{activeGoals.length}</p>
        <p className="text-xs text-indigo-500 mt-1">
          {goalsOnTrack} von {activeGoals.length} auf Kurs
        </p>
      </div>

      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-600">Erreicht</p>
        </div>
        <p className="text-2xl font-bold text-emerald-700">{achievedGoals.length}</p>
        <p className="text-xs text-emerald-500 mt-1">
          Ziele dieses Jahr erreicht
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <ClockIcon className="h-5 w-5 text-blue-600" />
          <p className="text-sm font-medium text-blue-600">Noch zu sparen</p>
        </div>
        <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalRemaining)}</p>
        <p className="text-xs text-blue-500 mt-1">
          von {formatCurrency(totalTarget)} Zielsum
        </p>
      </div>

      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm font-medium text-slate-600">Aktueller Stand</p>
        </div>
        <p className="text-2xl font-bold text-slate-700">{formatCurrency(totalCurrent)}</p>
        <p className="text-xs text-slate-500 mt-1">
          {pausedGoals.length > 0 && `${pausedGoals.length} pausiert`}
        </p>
      </div>
    </div>
  );
}
