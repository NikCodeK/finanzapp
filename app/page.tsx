'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSharedFinancialProfile } from '@/contexts/FinancialProfileContext';
import { useGoals } from '@/hooks/useGoals';
import { useBudgets } from '@/hooks/useBudgets';
import { useTransactions } from '@/hooks/useTransactions';
import { useCreditCards } from '@/hooks/useCreditCards';
import KPICard from '@/components/KPICard';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import QuickTransactionAdd from '@/components/QuickTransactionAdd';
import CreditCardWidget from '@/components/CreditCardWidget';
import Link from 'next/link';
import { addTransaction } from '@/lib/supabase-storage';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  WalletIcon,
  FlagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency, getMonthRange, toDateISO, classNames } from '@/lib/utils';
import { groupByCategory } from '@/lib/calculations';

export default function Dashboard() {
  const {
    incomeSources,
    monthlyIncome,
    monthlyIncomeWithoutBonus,
    monthlyBonusIncome,
    quarterlyBonusOverview,
    monthlyFixedCosts,
    monthlyVariableCosts,
    monthlyDebtPayments,
    totalDebt,
    totalAssets,
    netWorth,
    availableIncome,
    savingsRate,
    healthScore,
    isLoading,
  } = useSharedFinancialProfile();

  const { goals } = useGoals(new Date().getFullYear());
  const { getCurrentMonthBudgets } = useBudgets();
  const {
    creditCards,
    totalCreditCardDebt,
    totalCreditLimit,
    averageUtilization,
    addBalance,
  } = useCreditCards();

  // Get current month transactions for budget calculation
  const monthRange = getMonthRange(new Date());
  const monthStartISO = toDateISO(monthRange.start);
  const monthEndISO = toDateISO(monthRange.end);
  const { transactions: monthTransactions, refresh: refreshTransactions } = useTransactions({
    mode: 'range',
    startDateISO: monthStartISO,
    endDateISO: monthEndISO,
  });

  // Handler for quick transaction add
  const handleQuickAdd = async (transaction: Parameters<typeof addTransaction>[0]) => {
    const result = await addTransaction(transaction);
    if (result) {
      // Refresh transactions to update budget widget
      refreshTransactions();
    }
    return result;
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate budget status for dashboard widget
  const budgetStatus = useMemo(() => {
    const budgets = getCurrentMonthBudgets();
    if (budgets.length === 0) return [];

    const expenseByCategory = groupByCategory(monthTransactions, 'expense');

    return budgets
      .map((budget) => {
        const spent = expenseByCategory[budget.category] || 0;
        const percentage = budget.budgetAmount > 0
          ? (spent / budget.budgetAmount) * 100
          : 0;
        return {
          category: budget.category,
          budgetAmount: budget.budgetAmount,
          spent,
          percentage,
          isOverBudget: spent > budget.budgetAmount,
          isWarning: percentage >= 80 && percentage < 100,
        };
      })
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);
  }, [getCurrentMonthBudgets, monthTransactions]);

  if (!mounted || isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const totalExpenses = monthlyFixedCosts + monthlyVariableCosts + monthlyDebtPayments;
  const activeGoals = goals.filter(g => g.status === 'aktiv');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Deine finanzielle Übersicht</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-slate-500">Health Score</p>
            <p className={`text-2xl font-bold ${healthScore >= 70 ? 'text-green-600' : healthScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
              {healthScore}/100
            </p>
          </div>
        </div>
      </div>

      {/* Quick Transaction Add */}
      <QuickTransactionAdd onAdd={handleQuickAdd} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Monatl. Einkommen"
          value={formatCurrency(monthlyIncome)}
          subtitle={monthlyBonusIncome > 0 ? `inkl. ${formatCurrency(monthlyBonusIncome)} Bonus` : 'Gesamt'}
          variant="income"
          icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
        />
        <KPICard
          title="Monatl. Ausgaben"
          value={formatCurrency(totalExpenses)}
          subtitle={`Fix: ${formatCurrency(monthlyFixedCosts)}`}
          variant="expense"
          icon={<ArrowTrendingDownIcon className="h-6 w-6" />}
        />
        <KPICard
          title="Verfügbar"
          value={formatCurrency(availableIncome)}
          subtitle={`Sparquote: ${(savingsRate * 100).toFixed(0)}%`}
          variant={availableIncome >= 0 ? 'income' : 'expense'}
          icon={<WalletIcon className="h-6 w-6" />}
        />
        <KPICard
          title="Nettovermögen"
          value={formatCurrency(netWorth)}
          subtitle={`Vermögen: ${formatCurrency(totalAssets)}`}
          variant={netWorth >= 0 ? 'income' : 'expense'}
          icon={<BanknotesIcon className="h-6 w-6" />}
        />
      </div>

      {/* Gehalt Aufschlüsselung */}
      <Card>
        <CardHeader
          title="Gehaltsübersicht"
          subtitle="Monatliches Einkommen aufgeschlüsselt"
          action={
            <Link href="/finanzen">
              <Button variant="ghost" size="sm">Bearbeiten</Button>
            </Link>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-500">Basis (ohne Bonus)</p>
            <p className="text-2xl font-bold text-slate-700">{formatCurrency(monthlyIncomeWithoutBonus)}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4">
            <p className="text-sm text-emerald-600">+ Bonus-Anteil</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(monthlyBonusIncome)}</p>
            {quarterlyBonusOverview && (
              <p className="text-xs text-emerald-500 mt-1">
                {quarterlyBonusOverview.confirmedCount}/4 Quartale bestätigt
              </p>
            )}
          </div>
          <div className="bg-green-100 rounded-lg p-4">
            <p className="text-sm text-green-700 font-medium">Gesamt</p>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(monthlyIncome)}</p>
          </div>
        </div>

        {/* Quartalsbonus Übersicht */}
        {quarterlyBonusOverview && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-3">Quartalsbonus {new Date().getFullYear()}</p>
            <div className="grid grid-cols-4 gap-2">
              {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((quarter) => {
                const isConfirmed = quarterlyBonusOverview.confirmedQuarters[quarter];
                return (
                  <div
                    key={quarter}
                    className={`flex flex-col items-center p-3 rounded-lg ${
                      isConfirmed ? 'bg-green-100' : 'bg-slate-100'
                    }`}
                  >
                    <span className={`text-sm font-bold ${isConfirmed ? 'text-green-700' : 'text-slate-400'}`}>
                      {quarter}
                    </span>
                    {isConfirmed ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mt-1" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-slate-300 mt-1" />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Jahresbonus: {formatCurrency(quarterlyBonusOverview.totalConfirmedBonus)} von {formatCurrency(quarterlyBonusOverview.totalPotentialBonus)}
            </p>
          </div>
        )}
      </Card>

      {/* Ausgaben Übersicht */}
      <Card>
        <CardHeader title="Monatliche Ausgaben" subtitle="Aufschlüsselung" />
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-600">Fixkosten</span>
            <span className="font-semibold text-slate-900">{formatCurrency(monthlyFixedCosts)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-600">Variable Kosten</span>
            <span className="font-semibold text-slate-900">{formatCurrency(monthlyVariableCosts)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-600">Schuldenraten</span>
            <span className="font-semibold text-slate-900">{formatCurrency(monthlyDebtPayments)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border-t-2 border-red-200">
            <span className="font-medium text-red-700">Gesamt</span>
            <span className="font-bold text-red-700">{formatCurrency(totalExpenses)}</span>
          </div>
        </div>
      </Card>

      {/* Budget Status Widget */}
      {budgetStatus.length > 0 && (
        <Card>
          <CardHeader
            title="Budget-Status"
            subtitle="Diesen Monat"
            action={
              <Link href="/monthly">
                <Button variant="ghost" size="sm">Details</Button>
              </Link>
            }
          />
          <div className="space-y-3">
            {budgetStatus.map((budget) => (
              <div key={budget.category} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    {budget.isOverBudget ? (
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                    ) : budget.isWarning ? (
                      <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />
                    ) : (
                      <ChartBarIcon className="h-4 w-4 text-green-500" />
                    )}
                    <span className="font-medium text-slate-900">{budget.category}</span>
                  </div>
                  <span className="text-sm text-slate-500">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.budgetAmount)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={classNames(
                      'h-2 rounded-full transition-all',
                      budget.isOverBudget
                        ? 'bg-red-500'
                        : budget.isWarning
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    )}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
                <p
                  className={classNames(
                    'text-xs mt-1',
                    budget.isOverBudget
                      ? 'text-red-600'
                      : budget.isWarning
                      ? 'text-orange-600'
                      : 'text-slate-500'
                  )}
                >
                  {budget.percentage.toFixed(0)}% verbraucht
                  {budget.isOverBudget && ' - Budget überschritten!'}
                  {budget.isWarning && ' - Fast aufgebraucht'}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Kreditkarten Widget */}
      <CreditCardWidget
        creditCards={creditCards}
        totalCreditCardDebt={totalCreditCardDebt}
        totalCreditLimit={totalCreditLimit}
        averageUtilization={averageUtilization}
        onAddBalance={addBalance}
      />

      {/* Ziele */}
      {activeGoals.length > 0 && (
        <Card>
          <CardHeader
            title="Aktive Ziele"
            subtitle={`${activeGoals.length} Ziele für ${new Date().getFullYear()}`}
            action={
              <Link href={`/ziele/${new Date().getFullYear()}`}>
                <Button variant="ghost" size="sm">Alle Ziele</Button>
              </Link>
            }
          />
          <div className="space-y-3">
            {activeGoals.slice(0, 3).map((goal) => {
              // For income goals, use current monthlyIncome from profile
              const effectiveCurrentAmount = goal.type === 'einkommen' ? monthlyIncome : goal.currentAmount;
              const range = goal.targetAmount - goal.startAmount;
              const progress = range > 0
                ? (effectiveCurrentAmount - goal.startAmount) / range
                : 0;
              return (
                <div key={goal.id} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <FlagIcon className="h-4 w-4 text-indigo-500" />
                      <span className="font-medium text-slate-900">{goal.name}</span>
                    </div>
                    <span className="text-sm text-slate-500">
                      {formatCurrency(effectiveCurrentAmount)} / {formatCurrency(goal.targetAmount)}
                      {goal.type === 'einkommen' && '/M'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(Math.max(progress * 100, 0), 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{Math.round(Math.max(progress * 100, 0))}% erreicht</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Schnellaktionen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/finanzen" className="block">
          <div className="p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center">
            <BanknotesIcon className="h-6 w-6 mx-auto text-indigo-500" />
            <p className="text-sm font-medium text-slate-700 mt-2">Finanzen</p>
          </div>
        </Link>
        <Link href={`/ziele/${new Date().getFullYear()}`} className="block">
          <div className="p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center">
            <FlagIcon className="h-6 w-6 mx-auto text-indigo-500" />
            <p className="text-sm font-medium text-slate-700 mt-2">Ziele</p>
          </div>
        </Link>
        <Link href="/weekly" className="block">
          <div className="p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center">
            <WalletIcon className="h-6 w-6 mx-auto text-indigo-500" />
            <p className="text-sm font-medium text-slate-700 mt-2">Wochenbericht</p>
          </div>
        </Link>
        <Link href="/projection" className="block">
          <div className="p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center">
            <ArrowTrendingUpIcon className="h-6 w-6 mx-auto text-indigo-500" />
            <p className="text-sm font-medium text-slate-700 mt-2">Prognose</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
