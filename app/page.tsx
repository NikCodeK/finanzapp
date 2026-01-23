'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSharedFinancialProfile } from '@/contexts/FinancialProfileContext';
import { useGoals } from '@/hooks/useGoals';
import { useBudgets } from '@/hooks/useBudgets';
import { useTransactions } from '@/hooks/useTransactions';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useInvestments } from '@/hooks/useInvestments';
import { usePlanning } from '@/hooks/usePlanning';
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
  CreditCardIcon,
  BellAlertIcon,
  CurrencyEuroIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency, getMonthRange, toDateISO, classNames } from '@/lib/utils';
import { groupByCategory } from '@/lib/calculations';

export default function Dashboard() {
  const currentYear = new Date().getFullYear();
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
    assets,
    netWorth,
    availableIncome,
    savingsRate,
    healthScore,
    isLoading,
  } = useSharedFinancialProfile();

  const { goals } = useGoals(currentYear);
  const { getCurrentMonthBudgets } = useBudgets();
  const {
    creditCards,
    totalCreditCardDebt,
    totalCreditLimit,
    averageUtilization,
    addBalance,
  } = useCreditCards();

  // New features hooks
  const {
    monthlySubscriptionCost,
    upcomingCancellations,
    activeCount: activeSubscriptionCount,
  } = useSubscriptions();

  const {
    portfolioMetrics,
    monthlySavingsPlanAmount,
  } = useInvestments();

  const {
    purchasesWithProjection,
    activeEventBudgets,
  } = usePlanning();

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
  const [viewMode, setViewMode] = useState<'actual' | 'plan'>('actual');

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

  let incomeTransactionCount = 0;
  let expenseTransactionCount = 0;
  let actualIncome = 0;
  let actualExpenses = 0;

  for (const transaction of monthTransactions) {
    if (transaction.type === 'income') {
      incomeTransactionCount += 1;
      actualIncome += transaction.amount;
    } else {
      expenseTransactionCount += 1;
      actualExpenses += transaction.amount;
    }
  }
  const actualNet = actualIncome - actualExpenses;
  const actualSavingsRate = actualIncome > 0 ? actualNet / actualIncome : 0;

  const totalExpenses = monthlyFixedCosts + monthlyVariableCosts + monthlyDebtPayments;
  const expensesBase = viewMode === 'actual' ? actualExpenses : totalExpenses;
  const emergencyMonths = expensesBase > 0 ? assets.savings / expensesBase : 0;
  const activeGoals = goals.filter(g => g.status === 'aktiv');
  const displayIncome = viewMode === 'actual' ? actualIncome : monthlyIncome;
  const displayExpenses = viewMode === 'actual' ? actualExpenses : totalExpenses;
  const displayNet = viewMode === 'actual' ? actualNet : availableIncome;
  const displaySavingsRate = viewMode === 'actual' ? actualSavingsRate : savingsRate;

  const mobileQuickActions = [
    { href: '/finanzen', label: 'Finanzen', icon: BanknotesIcon },
    { href: '/subscriptions', label: 'Abos', icon: CreditCardIcon },
    { href: `/ziele/${currentYear}`, label: 'Ziele', icon: FlagIcon },
  ];
  const desktopQuickActions = [
    { href: '/finanzen', label: 'Finanzen', icon: BanknotesIcon },
    { href: '/subscriptions', label: 'Abos', icon: CreditCardIcon },
    { href: '/investments', label: 'Investments', icon: CurrencyEuroIcon },
    { href: '/planning', label: 'Planung', icon: ShoppingCartIcon },
    { href: '/analytics', label: 'Analyse', icon: ChartBarIcon },
    { href: `/ziele/${currentYear}`, label: 'Ziele', icon: FlagIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Deine finanzielle Übersicht</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-left sm:text-right">
            <p className="text-sm text-slate-500">Health Score</p>
            <p className={`text-xl sm:text-2xl font-bold ${healthScore >= 70 ? 'text-green-600' : healthScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
              {healthScore}/100
            </p>
          </div>
        </div>
      </div>

      {/* Quick Transaction Add */}
      <QuickTransactionAdd onAdd={handleQuickAdd} />

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Monatlicher Überblick</h2>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('actual')}
            className={classNames(
              'px-3 py-1 rounded-md font-medium transition-colors',
              viewMode === 'actual' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Ist
          </button>
          <button
            type="button"
            onClick={() => setViewMode('plan')}
            className={classNames(
              'px-3 py-1 rounded-md font-medium transition-colors',
              viewMode === 'plan' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Plan
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Monatl. Einkommen"
          value={formatCurrency(displayIncome)}
          subtitle={
            viewMode === 'actual'
              ? `${incomeTransactionCount} Einnahmen`
              : monthlyBonusIncome > 0
              ? `inkl. ${formatCurrency(monthlyBonusIncome)} Bonus`
              : 'Gesamt'
          }
          variant="income"
          icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
        />
        <KPICard
          title="Monatl. Ausgaben"
          value={formatCurrency(displayExpenses)}
          subtitle={
            viewMode === 'actual'
              ? `${expenseTransactionCount} Ausgaben`
              : `Fix: ${formatCurrency(monthlyFixedCosts)}`
          }
          variant="expense"
          icon={<ArrowTrendingDownIcon className="h-6 w-6" />}
        />
        <KPICard
          title="Verfügbar"
          value={formatCurrency(displayNet)}
          subtitle={`Sparquote: ${(displaySavingsRate * 100).toFixed(0)}%`}
          variant={displayNet >= 0 ? 'income' : 'expense'}
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
      <Card className="hidden sm:block">
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
        <CardHeader
          title="Monatliche Ausgaben"
          subtitle={viewMode === 'actual' ? 'Ist aus Transaktionen' : 'Plan-Aufschlüsselung'}
        />
        {viewMode === 'actual' ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Ist-Ausgaben (Transaktionen)</span>
              <span className="font-semibold text-slate-900">{formatCurrency(actualExpenses)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Plan-Ausgaben</span>
              <span className="font-semibold text-slate-900">{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Delta (Ist - Plan)</span>
              <span className={actualExpenses - totalExpenses <= 0 ? 'font-semibold text-green-600' : 'font-semibold text-red-600'}>
                {actualExpenses - totalExpenses <= 0 ? '-' : '+'}
                {formatCurrency(Math.abs(actualExpenses - totalExpenses))}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Notgroschen</span>
              <span className="font-semibold text-slate-900">
                {emergencyMonths.toFixed(1)} Monate
              </span>
            </div>
          </div>
        ) : (
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
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Notgroschen</span>
              <span className="font-semibold text-slate-900">
                {emergencyMonths.toFixed(1)} Monate
              </span>
            </div>
          </div>
        )}
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

      {/* Neue Feature Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Abo-Widget */}
        <Card>
          <CardHeader
            title="Abos"
            action={
              <Link href="/subscriptions">
                <Button variant="ghost" size="sm">Details</Button>
              </Link>
            }
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <CreditCardIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Monatliche Kosten</p>
                  <p className="text-xl font-bold text-slate-900">{formatCurrency(monthlySubscriptionCost)}</p>
                </div>
              </div>
              <span className="text-sm text-slate-500">{activeSubscriptionCount} aktiv</span>
            </div>
            {upcomingCancellations.length > 0 && (
              <div className="p-3 bg-orange-50 rounded-lg flex items-center gap-2">
                <BellAlertIcon className="h-5 w-5 text-orange-500" />
                <span className="text-sm text-orange-700">
                  {upcomingCancellations.length} Abo(s) bald kündbar
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Investment-Widget */}
        <Card className="hidden sm:block">
          <CardHeader
            title="Investments"
            action={
              <Link href="/investments">
                <Button variant="ghost" size="sm">Details</Button>
              </Link>
            }
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CurrencyEuroIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Portfolio-Wert</p>
                  <p className="text-xl font-bold text-slate-900">{formatCurrency(portfolioMetrics.totalValue)}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Performance</span>
              <span className={portfolioMetrics.totalGainLossPercent >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {portfolioMetrics.totalGainLossPercent >= 0 ? '+' : ''}{portfolioMetrics.totalGainLossPercent.toFixed(2)}%
              </span>
            </div>
            {monthlySavingsPlanAmount > 0 && (
              <div className="p-3 bg-indigo-50 rounded-lg text-sm text-indigo-700">
                Monatliche Sparpläne: {formatCurrency(monthlySavingsPlanAmount)}
              </div>
            )}
          </div>
        </Card>

        {/* Planung-Widget */}
        <Card className="hidden sm:block">
          <CardHeader
            title="Geplante Anschaffungen"
            action={
              <Link href="/planning">
                <Button variant="ghost" size="sm">Details</Button>
              </Link>
            }
          />
          <div className="space-y-3">
            {purchasesWithProjection.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                Keine Anschaffungen geplant
              </p>
            ) : (
              purchasesWithProjection.slice(0, 2).map((purchase) => (
                <div key={purchase.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-slate-900 text-sm">{purchase.name}</span>
                    <span className="text-xs text-slate-500">
                      {purchase.progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${purchase.isOnTrack === false ? 'bg-orange-500' : 'bg-indigo-500'}`}
                      style={{ width: `${Math.min(purchase.progress, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
            {activeEventBudgets.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  {activeEventBudgets.length} Event-Budget(s) aktiv
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Ziele */}
      {activeGoals.length > 0 && (
        <Card>
          <CardHeader
            title="Aktive Ziele"
            subtitle={`${activeGoals.length} Ziele für ${currentYear}`}
            action={
              <Link href={`/ziele/${currentYear}`}>
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
      <div className="grid grid-cols-3 gap-2 sm:hidden">
        {mobileQuickActions.map((item) => (
          <Link key={item.href} href={item.href} className="block">
            <div className="p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center">
              <item.icon className="h-6 w-6 mx-auto text-indigo-500" />
              <p className="text-sm font-medium text-slate-700 mt-2">{item.label}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
        {desktopQuickActions.map((item) => (
          <Link key={item.href} href={item.href} className="block">
            <div className="p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center">
              <item.icon className="h-6 w-6 mx-auto text-indigo-500" />
              <p className="text-sm font-medium text-slate-700 mt-2">{item.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
