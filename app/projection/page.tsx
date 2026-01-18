'use client';

import { useState, useEffect, useMemo } from 'react';
import { useGoals } from '@/hooks/useGoals';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import Card, { CardHeader } from '@/components/ui/Card';
import GoalProgressBar from '@/components/goals/GoalProgressBar';
import ProjectionLine from '@/components/charts/ProjectionLine';
import { formatCurrency, classNames, formatDate } from '@/lib/utils';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function ProjectionPage() {
  const currentYear = new Date().getFullYear();
  const { goals } = useGoals(currentYear);
  const {
    monthlyIncome,
    monthlyIncomeWithoutBonus,
    monthlyBonusIncome,
    monthlyFixedCosts,
    monthlyVariableCosts,
    monthlyDebtPayments,
    totalAssets,
    totalDebt,
    availableIncome,
    isLoading,
  } = useFinancialProfile();

  const [mounted, setMounted] = useState(false);
  const [scenario, setScenario] = useState<'base' | 'best' | 'worst'>('base');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate projection based on financial profile
  const projection = useMemo(() => {
    const months: Array<{
      month: string;
      income: number;
      expenses: number;
      net: number;
      cumulativeCash: number;
    }> = [];

    const startingCash = totalAssets;
    const monthlyExpenses = monthlyFixedCosts + monthlyVariableCosts + monthlyDebtPayments;

    // Scenario multipliers
    const multipliers = {
      base: { income: 1, expense: 1 },
      best: { income: 1.1, expense: 0.9 },
      worst: { income: 0.9, expense: 1.1 },
    };

    const mult = multipliers[scenario];
    let cumulative = startingCash;

    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const monthName = date.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' });

      const income = monthlyIncome * mult.income;
      const expenses = monthlyExpenses * mult.expense;
      const net = income - expenses;
      cumulative += net;

      months.push({
        month: monthName,
        income,
        expenses,
        net,
        cumulativeCash: cumulative,
      });
    }

    return months;
  }, [monthlyIncome, monthlyFixedCosts, monthlyVariableCosts, monthlyDebtPayments, totalAssets, scenario]);

  // All scenarios for chart
  const allScenarios = useMemo(() => {
    const generateScenario = (mult: { income: number; expense: number }) => {
      const months: Array<{
        month: string;
        income: number;
        expenses: number;
        net: number;
        cumulativeCash: number;
      }> = [];

      const startingCash = totalAssets;
      const monthlyExpenses = monthlyFixedCosts + monthlyVariableCosts + monthlyDebtPayments;
      let cumulative = startingCash;

      for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() + i);
        const monthName = date.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' });

        const income = monthlyIncome * mult.income;
        const expenses = monthlyExpenses * mult.expense;
        const net = income - expenses;
        cumulative += net;

        months.push({
          month: monthName,
          income,
          expenses,
          net,
          cumulativeCash: cumulative,
        });
      }

      return months;
    };

    return {
      base: generateScenario({ income: 1, expense: 1 }),
      best: generateScenario({ income: 1.1, expense: 0.9 }),
      worst: generateScenario({ income: 0.9, expense: 1.1 }),
    };
  }, [monthlyIncome, monthlyFixedCosts, monthlyVariableCosts, monthlyDebtPayments, totalAssets]);

  // Calculate goal projections
  const goalProjections = useMemo(() => {
    return goals
      .filter((g) => g.status === 'aktiv')
      .map((goal) => {
        // For income goals, use current monthlyIncome from profile
        const effectiveCurrentAmount = goal.type === 'einkommen' ? monthlyIncome : goal.currentAmount;
        const remaining = goal.targetAmount - effectiveCurrentAmount;

        // For income goals, progress is based on income increase, not savings
        const isIncomeGoal = goal.type === 'einkommen';
        const monthlySavings = availableIncome > 0 ? availableIncome : 0;

        // Income goals can't be projected the same way - they depend on salary increases
        const monthsToGoal = isIncomeGoal
          ? Infinity // Income goals can't be time-projected
          : (monthlySavings > 0 ? remaining / monthlySavings : Infinity);

        const deadline = new Date(goal.deadlineISO);
        const now = new Date();
        const monthsUntilDeadline =
          (deadline.getFullYear() - now.getFullYear()) * 12 +
          (deadline.getMonth() - now.getMonth());

        const projectedCompletionDate = new Date();
        projectedCompletionDate.setMonth(projectedCompletionDate.getMonth() + Math.ceil(monthsToGoal));

        // For income goals, check if current income already meets target
        const onTrack = isIncomeGoal
          ? effectiveCurrentAmount >= goal.targetAmount
          : monthsToGoal <= monthsUntilDeadline;

        const projectedAmount = isIncomeGoal
          ? effectiveCurrentAmount // Income goals don't accumulate
          : effectiveCurrentAmount + monthlySavings * Math.min(monthsUntilDeadline, 12);

        return {
          goal,
          effectiveCurrentAmount,
          remaining,
          monthsToGoal: Math.ceil(monthsToGoal),
          monthsUntilDeadline,
          projectedCompletionDate,
          onTrack,
          projectedAmount: Math.min(projectedAmount, goal.targetAmount),
          willComplete: isIncomeGoal ? effectiveCurrentAmount >= goal.targetAmount : monthsToGoal <= 12,
          isIncomeGoal,
        };
      });
  }, [goals, availableIncome, monthlyIncome]);

  if (!mounted || isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-slate-200 rounded-xl lg:col-span-2" />
          <div className="h-96 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const scenarios = [
    { key: 'base' as const, label: 'Basis', color: 'indigo' },
    { key: 'best' as const, label: 'Best Case', color: 'green' },
    { key: 'worst' as const, label: 'Worst Case', color: 'red' },
  ];

  const activeGoals = goals.filter((g) => g.status === 'aktiv');
  const totalExpenses = monthlyFixedCosts + monthlyVariableCosts + monthlyDebtPayments;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finanzprognose</h1>
          <p className="text-slate-500 mt-1">
            12-Monats-Prognose basierend auf deinen Finanzdaten
          </p>
        </div>
        <Link href="/finanzen">
          <Button variant="secondary">Finanzdaten bearbeiten</Button>
        </Link>
      </div>

      {/* Current Financial Data Summary */}
      <Card>
        <CardHeader title="Basis-Daten" subtitle="Aus 'Meine Finanzen'" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-emerald-50 rounded-lg p-4">
            <p className="text-xs text-emerald-600 uppercase">Monatl. Einkommen</p>
            <p className="text-xl font-bold text-emerald-700">{formatCurrency(monthlyIncome)}</p>
            {monthlyBonusIncome > 0 && (
              <p className="text-xs text-emerald-500">inkl. {formatCurrency(monthlyBonusIncome)} Bonus</p>
            )}
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-xs text-red-600 uppercase">Monatl. Ausgaben</p>
            <p className="text-xl font-bold text-red-700">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-blue-600 uppercase">Monatl. Verfügbar</p>
            <p className={`text-xl font-bold ${availableIncome >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
              {formatCurrency(availableIncome)}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-xs text-purple-600 uppercase">Startvermögen</p>
            <p className="text-xl font-bold text-purple-700">{formatCurrency(totalAssets)}</p>
          </div>
        </div>
      </Card>

      {/* Goals Integration */}
      {activeGoals.length > 0 && (
        <Card>
          <CardHeader
            title="Zielprognose"
            subtitle="Wann werden deine Ziele bei aktuellem Tempo erreicht?"
          />
          <div className="space-y-4">
            {goalProjections.map(({
              goal,
              effectiveCurrentAmount,
              remaining,
              monthsToGoal,
              monthsUntilDeadline,
              projectedCompletionDate,
              onTrack,
              willComplete,
              isIncomeGoal,
            }) => (
              <div
                key={goal.id}
                className={`p-4 rounded-lg border ${
                  onTrack ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-900">{goal.name}</h4>
                      {isIncomeGoal && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                          Einkommen
                        </span>
                      )}
                      {onTrack ? (
                        <span className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          <CheckCircleIcon className="h-3 w-3" />
                          {isIncomeGoal ? 'Ziel erreicht' : 'Auf Kurs'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          <ExclamationTriangleIcon className="h-3 w-3" />
                          {isIncomeGoal ? 'Noch nicht erreicht' : 'Hinter Plan'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      {isIncomeGoal
                        ? `Noch ${formatCurrency(Math.max(remaining, 0))}/Monat zu erhöhen`
                        : `Noch ${formatCurrency(remaining)} bis zum Ziel`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Deadline</p>
                    <p className="font-medium text-slate-700">{formatDate(goal.deadlineISO)}</p>
                  </div>
                </div>

                <GoalProgressBar
                  currentAmount={effectiveCurrentAmount}
                  targetAmount={goal.targetAmount}
                  startAmount={goal.startAmount}
                  size="sm"
                  showLabels={false}
                />

                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500">Monate bis Deadline</p>
                    <p className="font-medium">{monthsUntilDeadline}</p>
                  </div>
                  {isIncomeGoal ? (
                    <div>
                      <p className="text-slate-500">Aktuelles Einkommen</p>
                      <p className="font-medium text-indigo-600">{formatCurrency(effectiveCurrentAmount)}/M</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-slate-500">Monate bis Zielerreichung</p>
                      <p className={`font-medium ${monthsToGoal > monthsUntilDeadline ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {monthsToGoal === Infinity ? '-' : monthsToGoal}
                      </p>
                    </div>
                  )}
                  {isIncomeGoal ? (
                    <div>
                      <p className="text-slate-500">Ziel-Einkommen</p>
                      <p className="font-medium">{formatCurrency(goal.targetAmount)}/M</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-slate-500">Geschätztes Datum</p>
                      <p className="font-medium">
                        {monthsToGoal === Infinity
                          ? 'Nicht möglich'
                          : projectedCompletionDate.toLocaleDateString('de-DE', {
                              month: 'short',
                              year: 'numeric',
                            })}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-slate-500">{isIncomeGoal ? 'Ziel erreicht' : 'Erreichbar in 12 Mo.'}</p>
                    <p className={`font-medium ${willComplete ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {willComplete ? 'Ja' : 'Nein'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Chart */}
      <Card>
        <CardHeader
          title="Cash Flow Prognose"
          subtitle="Kumulierter Cashflow über 12 Monate"
        />
        <ProjectionLine
          base={allScenarios.base}
          best={allScenarios.best}
          worst={allScenarios.worst}
          showAllScenarios={true}
        />
      </Card>

      {/* Scenario Tabs */}
      <div className="flex gap-2">
        {scenarios.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setScenario(key)}
            className={classNames(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              scenario === key
                ? `bg-${color}-100 text-${color}-700 ring-2 ring-${color}-500`
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
            style={
              scenario === key
                ? {
                    backgroundColor:
                      color === 'indigo'
                        ? '#e0e7ff'
                        : color === 'green'
                        ? '#dcfce7'
                        : '#fee2e2',
                    color:
                      color === 'indigo'
                        ? '#4338ca'
                        : color === 'green'
                        ? '#15803d'
                        : '#b91c1c',
                  }
                : undefined
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Projection Table */}
      <Card padding="none">
        <div className="p-6 border-b border-slate-200">
          <CardHeader
            title="Monatliche Prognose"
            subtitle={`${
              scenario === 'base'
                ? 'Basis'
                : scenario === 'best'
                ? 'Best Case (+10% Einkommen, -10% Ausgaben)'
                : 'Worst Case (-10% Einkommen, +10% Ausgaben)'
            } Szenario`}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                  Monat
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">
                  Einnahmen
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">
                  Ausgaben
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">
                  Netto
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">
                  Kumuliert
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projection.map((month, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                    {month.month}
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600 text-right">
                    {formatCurrency(month.income)}
                  </td>
                  <td className="px-4 py-3 text-sm text-red-600 text-right">
                    {formatCurrency(month.expenses)}
                  </td>
                  <td
                    className={classNames(
                      'px-4 py-3 text-sm text-right font-medium',
                      month.net >= 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {formatCurrency(month.net)}
                  </td>
                  <td
                    className={classNames(
                      'px-4 py-3 text-sm text-right font-semibold',
                      month.cumulativeCash >= 0
                        ? 'text-indigo-600'
                        : 'text-orange-600'
                    )}
                  >
                    {formatCurrency(month.cumulativeCash)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map(({ key, label, color }) => {
          const data = allScenarios[key];
          const finalMonth = data[data.length - 1];
          const totalIncome = data.reduce((sum, m) => sum + m.income, 0);
          const totalExpensesScenario = data.reduce((sum, m) => sum + m.expenses, 0);

          return (
            <Card
              key={key}
              className={classNames(
                'border-2',
                scenario === key
                  ? color === 'indigo'
                    ? 'border-indigo-500'
                    : color === 'green'
                    ? 'border-green-500'
                    : 'border-red-500'
                  : 'border-transparent'
              )}
            >
              <h3 className="font-semibold text-slate-900 mb-4">{label}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">
                    Gesamteinnahmen (12 Mo.)
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(totalIncome)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Gesamtausgaben</span>
                  <span className="text-sm font-medium text-red-600">
                    {formatCurrency(totalExpensesScenario)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">
                      Endstand (12 Mo.)
                    </span>
                    <span
                      className={classNames(
                        'text-sm font-semibold',
                        finalMonth?.cumulativeCash >= 0
                          ? 'text-indigo-600'
                          : 'text-orange-600'
                      )}
                    >
                      {formatCurrency(finalMonth?.cumulativeCash || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
