'use client';

import { Goal } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { CheckCircleIcon, ClockIcon, FlagIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline';

interface GoalsSummaryProps {
  goals: Goal[];
  getGoalProgress: (goal: Goal, currentIncome?: number) => number;
  monthlyIncome?: number;
}

export default function GoalsSummary({ goals, getGoalProgress, monthlyIncome }: GoalsSummaryProps) {
  const activeGoals: Goal[] = [];
  let achievedGoalsCount = 0;
  let pausedGoalsCount = 0;
  let savingsGoalsCount = 0;
  let totalTarget = 0;
  let totalCurrent = 0;
  let incomeGoal: Goal | undefined;

  for (const goal of goals) {
    if (goal.status === 'aktiv') {
      activeGoals.push(goal);
      if (goal.type === 'einkommen' && !incomeGoal) {
        incomeGoal = goal;
      }
      if (goal.type !== 'einkommen' && goal.type !== 'investition') {
        savingsGoalsCount += 1;
        totalTarget += goal.targetAmount;
        totalCurrent += goal.currentAmount;
      }
    } else if (goal.status === 'erreicht') {
      achievedGoalsCount += 1;
    } else if (goal.status === 'pausiert') {
      pausedGoalsCount += 1;
    }
  }

  const totalRemaining = totalTarget - totalCurrent;

  const incomeProgress = incomeGoal && monthlyIncome !== undefined
    ? Math.min(100, Math.round((monthlyIncome / incomeGoal.targetAmount) * 100))
    : 0;

  const goalsOnTrack = activeGoals.filter((goal) => {
    const now = new Date();
    const deadline = new Date(goal.deadlineISO);
    const created = new Date(goal.createdAtISO);
    const totalDays = (deadline.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    const daysPassed = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    const expectedProgress = daysPassed / totalDays;
    const actualProgress = getGoalProgress(goal, monthlyIncome);
    return actualProgress >= expectedProgress * 0.9;
  }).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
        <p className="text-2xl font-bold text-emerald-700">{achievedGoalsCount}</p>
        <p className="text-xs text-emerald-500 mt-1">
          Ziele dieses Jahr erreicht
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <ClockIcon className="h-5 w-5 text-blue-600" />
          <p className="text-sm font-medium text-blue-600">Noch zu sparen</p>
        </div>
        <p className="text-2xl font-bold text-blue-700">{formatCurrency(Math.max(0, totalRemaining))}</p>
        <p className="text-xs text-blue-500 mt-1">
          {savingsGoalsCount > 0 ? `von ${formatCurrency(totalTarget)} Zielsumme` : 'Keine Sparziele'}
        </p>
      </div>

      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm font-medium text-slate-600">Gespart</p>
        </div>
        <p className="text-2xl font-bold text-slate-700">{formatCurrency(totalCurrent)}</p>
        <p className="text-xs text-slate-500 mt-1">
          {savingsGoalsCount} Sparziel{savingsGoalsCount !== 1 ? 'e' : ''}
          {pausedGoalsCount > 0 && ` · ${pausedGoalsCount} pausiert`}
        </p>
      </div>

      <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
        <div className="flex items-center gap-2 mb-2">
          <CurrencyEuroIcon className="h-5 w-5 text-amber-600" />
          <p className="text-sm font-medium text-amber-600">Einkommensziel</p>
        </div>
        {incomeGoal ? (
          <>
            <p className="text-2xl font-bold text-amber-700">
              {formatCurrency(monthlyIncome || 0)}
            </p>
            <p className="text-xs text-amber-500 mt-1">
              von {formatCurrency(incomeGoal.targetAmount)} ({incomeProgress}%)
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-bold text-amber-700">–</p>
            <p className="text-xs text-amber-500 mt-1">Kein Einkommensziel</p>
          </>
        )}
      </div>
    </div>
  );
}
