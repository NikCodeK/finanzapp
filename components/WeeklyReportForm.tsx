'use client';

import { useState, useEffect } from 'react';
import { WeeklyReport, EnhancedWeeklyReport, Goal } from '@/lib/types';
import { formatDate, toDateISO, getWeekRange, formatCurrency } from '@/lib/utils';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';
import Select from './ui/Select';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface WeeklyReportFormProps {
  onSave: (report: Omit<EnhancedWeeklyReport, 'id'>) => void;
  onCancel: () => void;
  initialData?: EnhancedWeeklyReport | null;
  calculatedData?: {
    income: number;
    expenses: number;
    net: number;
  };
  previousWeekData?: {
    income: number;
    expenses: number;
    net: number;
  };
  goals?: Goal[];
}

const moodEmojis = ['😞', '😕', '😐', '🙂', '😊'] as const;

export default function WeeklyReportForm({
  onSave,
  onCancel,
  initialData,
  calculatedData,
  previousWeekData,
  goals = [],
}: WeeklyReportFormProps) {
  const weekRange = getWeekRange(new Date());

  const [weekStartISO, setWeekStartISO] = useState(
    initialData?.weekStartISO || toDateISO(weekRange.start)
  );
  const [weekEndISO, setWeekEndISO] = useState(
    initialData?.weekEndISO || toDateISO(weekRange.end)
  );
  const [income, setIncome] = useState(
    initialData?.income.toString() || calculatedData?.income.toString() || '0'
  );
  const [expenses, setExpenses] = useState(
    initialData?.expenses.toString() || calculatedData?.expenses.toString() || '0'
  );
  const [top3, setTop3] = useState(initialData?.top3 || '');
  const [insights, setInsights] = useState(initialData?.insights || '');
  const [nextDecision, setNextDecision] = useState(initialData?.nextDecision || '');
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(initialData?.mood || 3);

  // New enhanced fields
  const [biggestWin, setBiggestWin] = useState(initialData?.biggestWin || '');
  const [biggestChallenge, setBiggestChallenge] = useState(initialData?.biggestChallenge || '');
  const [savingsThisWeek, setSavingsThisWeek] = useState(
    initialData?.savingsThisWeek?.toString() || ''
  );
  const [goalContributions, setGoalContributions] = useState<
    { goalId: string; amount: number }[]
  >(initialData?.goalContributions || []);

  useEffect(() => {
    if (calculatedData && !initialData) {
      setIncome(calculatedData.income.toString());
      setExpenses(calculatedData.expenses.toString());
    }
  }, [calculatedData, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const incomeNum = parseFloat(income) || 0;
    const expensesNum = parseFloat(expenses) || 0;

    const report: Omit<EnhancedWeeklyReport, 'id'> = {
      weekStartISO,
      weekEndISO,
      income: incomeNum,
      expenses: expensesNum,
      net: incomeNum - expensesNum,
      top3,
      insights,
      nextDecision,
      mood,
      // Enhanced fields
      biggestWin: biggestWin || undefined,
      biggestChallenge: biggestChallenge || undefined,
      savingsThisWeek: savingsThisWeek ? parseFloat(savingsThisWeek) : undefined,
      goalContributions: goalContributions.length > 0 ? goalContributions : undefined,
      // Comparison data (will be calculated by hook)
      previousWeekIncome: previousWeekData?.income,
      previousWeekExpenses: previousWeekData?.expenses,
      incomeChange: previousWeekData ? incomeNum - previousWeekData.income : undefined,
      expenseChange: previousWeekData ? expensesNum - previousWeekData.expenses : undefined,
    };

    onSave(report);
  };

  const incomeNum = parseFloat(income) || 0;
  const expensesNum = parseFloat(expenses) || 0;
  const netNum = incomeNum - expensesNum;

  const incomeChange = previousWeekData ? incomeNum - previousWeekData.income : null;
  const expenseChange = previousWeekData ? expensesNum - previousWeekData.expenses : null;

  const ChangeIndicator = ({
    change,
    inverted = false,
  }: {
    change: number | null;
    inverted?: boolean;
  }) => {
    if (change === null) return null;

    const isPositive = inverted ? change < 0 : change > 0;
    const isNegative = inverted ? change > 0 : change < 0;

    if (change === 0) {
      return (
        <span className="flex items-center text-xs text-slate-500">
          <MinusIcon className="h-3 w-3 mr-1" />
          Gleich
        </span>
      );
    }

    return (
      <span
        className={`flex items-center text-xs ${
          isPositive ? 'text-emerald-600' : 'text-red-600'
        }`}
      >
        {change > 0 ? (
          <ArrowUpIcon className="h-3 w-3 mr-1" />
        ) : (
          <ArrowDownIcon className="h-3 w-3 mr-1" />
        )}
        {formatCurrency(Math.abs(change))}
      </span>
    );
  };

  const addGoalContribution = () => {
    const activeGoals = goals.filter((g) => g.status === 'aktiv');
    if (activeGoals.length === 0) return;

    const usedGoalIds = goalContributions.map((gc) => gc.goalId);
    const availableGoal = activeGoals.find((g) => !usedGoalIds.includes(g.id));

    if (availableGoal) {
      setGoalContributions([
        ...goalContributions,
        { goalId: availableGoal.id, amount: 0 },
      ]);
    }
  };

  const updateGoalContribution = (index: number, field: 'goalId' | 'amount', value: string) => {
    const updated = [...goalContributions];
    if (field === 'goalId') {
      updated[index].goalId = value;
    } else {
      updated[index].amount = parseFloat(value) || 0;
    }
    setGoalContributions(updated);
  };

  const removeGoalContribution = (index: number) => {
    setGoalContributions(goalContributions.filter((_, i) => i !== index));
  };

  const activeGoals = goals.filter((g) => g.status === 'aktiv');

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-900">
          {initialData ? 'Wochenbericht bearbeiten' : 'Neuer Wochenbericht'}
        </h3>

        {/* Week Selection */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Wochenstart"
            type="date"
            value={weekStartISO}
            onChange={(e) => setWeekStartISO(e.target.value)}
            required
          />
          <Input
            label="Wochenende"
            type="date"
            value={weekEndISO}
            onChange={(e) => setWeekEndISO(e.target.value)}
            required
          />
        </div>

        {/* Financial Data with Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Einnahmen"
              type="number"
              step="0.01"
              min="0"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />
            {previousWeekData && (
              <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>Letzte Woche: {formatCurrency(previousWeekData.income)}</span>
                <ChangeIndicator change={incomeChange} />
              </div>
            )}
          </div>
          <div>
            <Input
              label="Ausgaben"
              type="number"
              step="0.01"
              min="0"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
            />
            {previousWeekData && (
              <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>Letzte Woche: {formatCurrency(previousWeekData.expenses)}</span>
                <ChangeIndicator change={expenseChange} inverted />
              </div>
            )}
          </div>
        </div>

        {/* Net Display */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Netto</p>
              <p
                className={`text-xl font-semibold ${
                  netNum >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(netNum)}
              </p>
            </div>
            {previousWeekData && (
              <div className="text-right">
                <p className="text-xs text-slate-500">Vorwoche</p>
                <p
                  className={`text-sm font-medium ${
                    previousWeekData.net >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(previousWeekData.net)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Savings This Week */}
        <Input
          label="Diese Woche gespart"
          type="number"
          step="0.01"
          min="0"
          value={savingsThisWeek}
          onChange={(e) => setSavingsThisWeek(e.target.value)}
          placeholder="Betrag der auf Sparkonto ging"
        />

        {/* Goal Contributions */}
        {activeGoals.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">
                Beiträge zu Zielen
              </label>
              {goalContributions.length < activeGoals.length && (
                <button
                  type="button"
                  onClick={addGoalContribution}
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <PlusIcon className="h-4 w-4" />
                  Hinzufügen
                </button>
              )}
            </div>
            {goalContributions.length === 0 ? (
              <p className="text-sm text-slate-500 italic">
                Noch keine Zielbeiträge erfasst
              </p>
            ) : (
              <div className="space-y-2">
                {goalContributions.map((gc, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <select
                      value={gc.goalId}
                      onChange={(e) => updateGoalContribution(index, 'goalId', e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {activeGoals.map((goal) => (
                        <option key={goal.id} value={goal.id}>
                          {goal.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={gc.amount}
                      onChange={(e) => updateGoalContribution(index, 'amount', e.target.value)}
                      placeholder="Betrag"
                      className="w-28 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeGoalContribution(index)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Top 3 Categories */}
        <Input
          label="Top 3 Ausgabenkategorien"
          value={top3}
          onChange={(e) => setTop3(e.target.value)}
          placeholder="z.B. Miete, Lebensmittel, Transport"
        />

        {/* Biggest Win */}
        <Input
          label="Größter Erfolg diese Woche"
          value={biggestWin}
          onChange={(e) => setBiggestWin(e.target.value)}
          placeholder="z.B. 50€ beim Einkaufen gespart"
        />

        {/* Biggest Challenge */}
        <Input
          label="Größte Herausforderung"
          value={biggestChallenge}
          onChange={(e) => setBiggestChallenge(e.target.value)}
          placeholder="z.B. Unerwartete Autoreparatur"
        />

        {/* Insights */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Erkenntnisse
          </label>
          <textarea
            value={insights}
            onChange={(e) => setInsights(e.target.value)}
            placeholder="Was ist diese Woche gut oder schlecht gelaufen?"
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Next Decision */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nächste Entscheidung
          </label>
          <textarea
            value={nextDecision}
            onChange={(e) => setNextDecision(e.target.value)}
            placeholder="Was nehmen Sie sich für die nächste Woche vor?"
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Mood */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Wie fühlen Sie sich mit Ihren Finanzen?
          </label>
          <div className="flex gap-2">
            {moodEmojis.map((emoji, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setMood((index + 1) as 1 | 2 | 3 | 4 | 5)}
                className={`w-12 h-12 text-2xl rounded-lg transition-all ${
                  mood === index + 1
                    ? 'bg-indigo-100 ring-2 ring-indigo-500'
                    : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button type="submit">
            {initialData ? 'Speichern' : 'Bericht erstellen'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
