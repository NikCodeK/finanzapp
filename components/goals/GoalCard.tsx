'use client';

import Link from 'next/link';
import { Goal, GOAL_TYPES, IncomeMilestone } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PencilIcon, TrashIcon, CheckCircleIcon, PauseCircleIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import GoalProgressBar from './GoalProgressBar';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onUpdateProgress: (id: string, amount: number) => void;
  currentIncome?: number;
}

export default function GoalCard({
  goal,
  onEdit,
  onDelete,
  onUpdateProgress,
  currentIncome,
}: GoalCardProps) {
  const isIncomeGoal = goal.type === 'einkommen';
  // For income goals, use current income from financial profile
  const effectiveCurrentAmount = isIncomeGoal && currentIncome !== undefined
    ? currentIncome
    : goal.currentAmount;
  const getTypeLabel = (type: Goal['type']) => {
    return GOAL_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getStatusBadge = () => {
    switch (goal.status) {
      case 'erreicht':
        return (
          <span className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
            <CheckCircleIcon className="h-3 w-3" />
            Erreicht
          </span>
        );
      case 'pausiert':
        return (
          <span className="flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
            <PauseCircleIcon className="h-3 w-3" />
            Pausiert
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = () => {
    const colors = {
      1: 'bg-red-100 text-red-700',
      2: 'bg-yellow-100 text-yellow-700',
      3: 'bg-blue-100 text-blue-700',
    };
    const labels = {
      1: 'Hoch',
      2: 'Mittel',
      3: 'Niedrig',
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${colors[goal.priority]}`}>
        {labels[goal.priority]}
      </span>
    );
  };

  const remaining = goal.targetAmount - effectiveCurrentAmount;
  const isOnTrack = () => {
    if (goal.status !== 'aktiv') return null;
    const now = new Date();
    const deadline = new Date(goal.deadlineISO);
    const created = new Date(goal.createdAtISO);
    const totalDays = (deadline.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    const daysPassed = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    const expectedProgress = daysPassed / totalDays;
    const range = goal.targetAmount - goal.startAmount;
    const actualProgress = range > 0 ? (effectiveCurrentAmount - goal.startAmount) / range : 0;
    return actualProgress >= expectedProgress * 0.9;
  };

  const onTrack = isOnTrack();

  return (
    <div
      className={`p-5 rounded-xl border ${
        goal.status === 'erreicht'
          ? 'bg-emerald-50 border-emerald-200'
          : goal.status === 'pausiert'
          ? 'bg-slate-50 border-slate-200 opacity-70'
          : 'bg-white border-slate-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900">{goal.name}</h3>
            {getStatusBadge()}
            {onTrack !== null && goal.status === 'aktiv' && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  onTrack ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}
              >
                {onTrack ? 'Auf Kurs' : 'Hinter Plan'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
              {getTypeLabel(goal.type)}
            </span>
            {getPriorityBadge()}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(goal)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <GoalProgressBar
          currentAmount={effectiveCurrentAmount}
          targetAmount={goal.targetAmount}
          startAmount={goal.startAmount}
          milestones={isIncomeGoal ? goal.milestones : undefined}
        />
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-500">{isIncomeGoal ? 'Ziel-Einkommen' : 'Ziel'}</p>
          <p className="font-semibold text-slate-900">{formatCurrency(goal.targetAmount)}</p>
        </div>
        <div>
          <p className="text-slate-500">{isIncomeGoal ? 'Noch zu erhöhen' : 'Noch zu sparen'}</p>
          <p className={`font-semibold ${remaining <= 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
            {remaining <= 0 ? 'Erreicht!' : isIncomeGoal ? `${formatCurrency(remaining)}/Monat` : formatCurrency(remaining)}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Deadline</p>
          <p className="font-medium text-slate-700">{formatDate(goal.deadlineISO)}</p>
        </div>
        <div>
          <p className="text-slate-500">{isIncomeGoal ? 'Start-Einkommen' : 'Startbetrag'}</p>
          <p className="font-medium text-slate-700">{formatCurrency(goal.startAmount)}</p>
        </div>
        {isIncomeGoal && (
          <div className="col-span-2">
            <p className="text-slate-500">Aktuelles Einkommen</p>
            <p className="font-semibold text-indigo-600">{formatCurrency(effectiveCurrentAmount)}/Monat</p>
          </div>
        )}
      </div>

      {/* Milestones for Income Goals */}
      {isIncomeGoal && goal.milestones && goal.milestones.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-xs font-medium text-slate-500 mb-2">Meilensteine</p>
          <div className="space-y-2">
            {goal.milestones.map((milestone, index) => {
              const isReached = effectiveCurrentAmount >= milestone.targetAmount;
              const isNext = !isReached && (index === 0 || effectiveCurrentAmount >= goal.milestones![index - 1].targetAmount);
              return (
                <div
                  key={milestone.id}
                  className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                    isReached
                      ? 'bg-emerald-50 border border-emerald-200'
                      : isNext
                      ? 'bg-indigo-50 border border-indigo-200'
                      : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isReached ? (
                      <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <div className={`h-4 w-4 rounded-full border-2 ${isNext ? 'border-indigo-400' : 'border-slate-300'}`} />
                    )}
                    <span className={isReached ? 'text-emerald-700' : isNext ? 'text-indigo-700' : 'text-slate-600'}>
                      {milestone.name || `Meilenstein ${index + 1}`}
                    </span>
                  </div>
                  <span className={`font-medium ${isReached ? 'text-emerald-600' : isNext ? 'text-indigo-600' : 'text-slate-500'}`}>
                    {formatCurrency(milestone.targetAmount)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {goal.milestones.filter(m => effectiveCurrentAmount >= m.targetAmount).length} von {goal.milestones.length} erreicht
          </div>
        </div>
      )}

      {/* Quick Update */}
      {goal.status === 'aktiv' && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          {isIncomeGoal ? (
            <Link
              href="/finanzen"
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              Einkommen in Finanzen anpassen
            </Link>
          ) : (
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Neuer Betrag"
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = parseFloat((e.target as HTMLInputElement).value);
                    if (!isNaN(value)) {
                      onUpdateProgress(goal.id, value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                  const value = parseFloat(input.value);
                  if (!isNaN(value)) {
                    onUpdateProgress(goal.id, value);
                    input.value = '';
                  }
                }}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Aktualisieren
              </button>
            </div>
          )}
        </div>
      )}

      {/* Note */}
      {goal.note && (
        <p className="mt-3 text-sm text-slate-500 italic">{goal.note}</p>
      )}
    </div>
  );
}
