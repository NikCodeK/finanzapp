'use client';

import { useState, useEffect, useMemo } from 'react';
import { useProjection } from '@/hooks/useProjection';
import { useGoals } from '@/hooks/useGoals';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import Card, { CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ProjectionLine from '@/components/charts/ProjectionLine';
import GoalProgressBar from '@/components/goals/GoalProgressBar';
import { formatCurrency, classNames, formatDate } from '@/lib/utils';
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ProjectionPage() {
  const {
    settings,
    scenario,
    setScenario,
    updateField,
    projection,
    allScenarios,
    isLoading,
  } = useProjection();

  const currentYear = new Date().getFullYear();
  const { goals } = useGoals(currentYear);
  const {
    monthlyIncome,
    monthlyFixedCosts,
    monthlyVariableCosts,
    availableIncome,
  } = useFinancialProfile();

  const [mounted, setMounted] = useState(false);
  const [useLiveData, setUseLiveData] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate goal projections
  const goalProjections = useMemo(() => {
    return goals
      .filter((g) => g.status === 'aktiv')
      .map((goal) => {
        const remaining = goal.targetAmount - goal.currentAmount;
        const monthlySavings = availableIncome > 0 ? availableIncome : 0;
        const monthsToGoal = monthlySavings > 0 ? remaining / monthlySavings : Infinity;
        const deadline = new Date(goal.deadlineISO);
        const now = new Date();
        const monthsUntilDeadline =
          (deadline.getFullYear() - now.getFullYear()) * 12 +
          (deadline.getMonth() - now.getMonth());

        const projectedCompletionDate = new Date();
        projectedCompletionDate.setMonth(projectedCompletionDate.getMonth() + Math.ceil(monthsToGoal));

        const onTrack = monthsToGoal <= monthsUntilDeadline;
        const projectedAmount = goal.currentAmount + monthlySavings * Math.min(monthsUntilDeadline, 12);

        return {
          goal,
          remaining,
          monthsToGoal: Math.ceil(monthsToGoal),
          monthsUntilDeadline,
          projectedCompletionDate,
          onTrack,
          projectedAmount: Math.min(projectedAmount, goal.targetAmount),
          willComplete: monthsToGoal <= 12,
        };
      });
  }, [goals, availableIncome]);

  // Apply live data from financial profile
  const handleApplyLiveData = () => {
    updateField('expectedIncome', monthlyIncome);
    updateField('fixedCosts', monthlyFixedCosts);
    updateField('variableCosts', monthlyVariableCosts);
    setUseLiveData(true);
  };

  if (!mounted || isLoading || !settings) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finanzprognose</h1>
          <p className="text-slate-500 mt-1">
            12-Monats-Prognose basierend auf Ihren Eingaben
          </p>
        </div>
        {monthlyIncome > 0 && (
          <Button
            variant={useLiveData ? 'secondary' : 'primary'}
            onClick={handleApplyLiveData}
          >
            {useLiveData ? 'Live-Daten angewendet' : 'Live-Daten aus "Meine Finanzen" laden'}
          </Button>
        )}
      </div>

      {/* Goals Integration */}
      {activeGoals.length > 0 && (
        <Card>
          <CardHeader
            title="Zielprognose"
            subtitle="Wann werden Ihre Ziele bei aktuellem Tempo erreicht?"
          />
          <div className="space-y-4">
            {goalProjections.map(({
              goal,
              remaining,
              monthsToGoal,
              monthsUntilDeadline,
              projectedCompletionDate,
              onTrack,
              willComplete,
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
                      {onTrack ? (
                        <span className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          <CheckCircleIcon className="h-3 w-3" />
                          Auf Kurs
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          <ExclamationTriangleIcon className="h-3 w-3" />
                          Hinter Plan
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      Noch {formatCurrency(remaining)} bis zum Ziel
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Deadline</p>
                    <p className="font-medium text-slate-700">{formatDate(goal.deadlineISO)}</p>
                  </div>
                </div>

                <GoalProgressBar
                  currentAmount={goal.currentAmount}
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
                  <div>
                    <p className="text-slate-500">Monate bis Zielerreichung</p>
                    <p className={`font-medium ${monthsToGoal > monthsUntilDeadline ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {monthsToGoal === Infinity ? '-' : monthsToGoal}
                    </p>
                  </div>
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
                  <div>
                    <p className="text-slate-500">Erreichbar in 12 Mo.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
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

        {/* Settings */}
        <Card>
          <CardHeader
            title="Einstellungen"
            subtitle={useLiveData ? 'Basierend auf Live-Daten' : undefined}
          />
          <div className="space-y-4">
            <Input
              label="Erwartetes Einkommen (monatlich)"
              type="number"
              value={settings.expectedIncome}
              onChange={(e) =>
                updateField('expectedIncome', parseFloat(e.target.value) || 0)
              }
            />
            <Input
              label="Fixkosten (monatlich)"
              type="number"
              value={settings.fixedCosts}
              onChange={(e) =>
                updateField('fixedCosts', parseFloat(e.target.value) || 0)
              }
            />
            <Input
              label="Variable Kosten (monatlich)"
              type="number"
              value={settings.variableCosts}
              onChange={(e) =>
                updateField('variableCosts', parseFloat(e.target.value) || 0)
              }
            />
            <Input
              label="Wachstumsrate (%)"
              type="number"
              step="0.1"
              value={settings.growthRate}
              onChange={(e) =>
                updateField('growthRate', parseFloat(e.target.value) || 0)
              }
            />
            <Input
              label="Startkapital"
              type="number"
              value={settings.startingCash}
              onChange={(e) =>
                updateField('startingCash', parseFloat(e.target.value) || 0)
              }
            />
            <Input
              label="Startschulden"
              type="number"
              value={settings.startingDebt}
              onChange={(e) =>
                updateField('startingDebt', parseFloat(e.target.value) || 0)
              }
            />
          </div>
        </Card>
      </div>

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
                ? 'Best Case'
                : 'Worst Case'
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
          const totalExpenses = data.reduce((sum, m) => sum + m.expenses, 0);

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
                    Gesamteinnahmen
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(totalIncome)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Gesamtausgaben</span>
                  <span className="text-sm font-medium text-red-600">
                    {formatCurrency(totalExpenses)}
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
