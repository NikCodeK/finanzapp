'use client';

import { useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import { useAnalytics } from '@/hooks/useAnalytics';
import Card, { CardHeader } from '@/components/ui/Card';
import SpendingPatterns from '@/components/analytics/SpendingPatterns';
import TrendAnalysis from '@/components/analytics/TrendAnalysis';
import { formatCurrency } from '@/lib/utils';
import { subMonths, format } from 'date-fns';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  // Load transactions for the last 6 months
  const today = new Date();
  const sixMonthsAgo = subMonths(today, 6);
  const startDateISO = format(sixMonthsAgo, 'yyyy-MM-dd');
  const endDateISO = format(today, 'yyyy-MM-dd');

  const { transactions, isLoading: transactionsLoading } = useTransactions({
    mode: 'range',
    startDateISO,
    endDateISO,
  });

  const { budgets, isLoading: budgetsLoading } = useBudgets();

  const {
    spendingPatterns,
    peakSpendingDay,
    categoryTrends,
    growingCategories,
    lifestyleInflationAlerts,
    missedSavingsOpportunities,
    totalMissedSavings,
    topSpendingCategories,
    averageMonthlyExpenses,
    monthlyTotals,
    savingsRateTrend,
  } = useAnalytics({
    transactions,
    budgets,
    monthsBack: 6,
  });

  const isLoading = transactionsLoading || budgetsLoading;

  // Calculate total expenses and income from transactions
  const totalStats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, net: income - expenses };
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ausgaben-Analyse</h1>
        <p className="text-slate-500 mt-1">
          Insights aus den letzten 6 Monaten
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Einnahmen (6M)</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(totalStats.income)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Ausgaben (6M)</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(totalStats.expenses)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Durchschnitt/Monat</p>
              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(averageMonthlyExpenses)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Budget-Überschreitung</p>
              <p className="text-xl font-bold text-orange-600">
                {formatCurrency(totalMissedSavings)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lifestyle Inflation Alerts */}
      {lifestyleInflationAlerts.length > 0 && (
        <Card>
          <CardHeader
            title="Lifestyle-Inflation Warnung"
            subtitle="Kategorien mit signifikantem Kostenanstieg"
          />
          <div className="space-y-3">
            {lifestyleInflationAlerts.map((alert) => (
              <div
                key={alert.category}
                className="p-4 bg-orange-50 border border-orange-200 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-orange-900">{alert.category}</p>
                    <p className="text-sm text-orange-700">{alert.message}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-slate-600">
                        Vorher: {formatCurrency(alert.previousAverage)}/M
                      </span>
                      <span className="text-orange-600 font-medium">
                        Jetzt: {formatCurrency(alert.currentAverage)}/M
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Patterns */}
        <Card>
          <CardHeader
            title="Ausgaben-Muster"
            subtitle="Wann gibst du am meisten aus?"
          />
          <SpendingPatterns
            patterns={spendingPatterns}
            peakDay={peakSpendingDay}
          />
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader
            title="Top Ausgaben-Kategorien"
            subtitle="Die letzten 6 Monate"
          />
          <div className="space-y-3">
            {topSpendingCategories.map((category, index) => (
              <div key={category.category} className="flex items-center gap-4">
                <span className="w-6 h-6 flex items-center justify-center bg-slate-200 rounded-full text-sm font-medium text-slate-600">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-900">
                      {category.category}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(category.total)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{
                        width: `${(category.total / topSpendingCategories[0].total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card>
        <CardHeader
          title="Trend-Analyse"
          subtitle="Entwicklung deiner Ausgaben über Zeit"
        />
        <TrendAnalysis
          categoryTrends={categoryTrends}
          growingCategories={growingCategories}
        />
      </Card>

      {/* Missed Savings Opportunities */}
      {missedSavingsOpportunities.length > 0 && (
        <Card>
          <CardHeader
            title="Sparpotenzial"
            subtitle="Was-wäre-wenn Rückblick auf diesen Monat"
          />
          <div className="space-y-3">
            {missedSavingsOpportunities.map((opportunity) => (
              <div
                key={opportunity.category}
                className="p-4 bg-slate-50 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-slate-900">{opportunity.category}</p>
                  <p className="text-sm text-slate-500">
                    Budget: {formatCurrency(opportunity.budgetAmount)} | Ausgegeben:{' '}
                    {formatCurrency(opportunity.actualSpent)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-600">
                    +{formatCurrency(opportunity.potentialSavings)}
                  </p>
                  <p className="text-xs text-slate-500">über Budget</p>
                </div>
              </div>
            ))}

            <div className="p-4 bg-orange-100 rounded-lg flex justify-between items-center">
              <div className="flex items-center gap-2">
                <LightBulbIcon className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-900">
                  Gesamtes Einsparpotenzial
                </span>
              </div>
              <span className="text-xl font-bold text-orange-600">
                {formatCurrency(totalMissedSavings)}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Monthly Overview */}
      <Card>
        <CardHeader
          title="Monatliche Übersicht"
          subtitle="Einnahmen vs. Ausgaben"
        />
        <div className="space-y-4">
          {monthlyTotals.map((month) => (
            <div key={month.monthISO} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-slate-900">{month.monthName}</span>
                <span
                  className={`font-bold ${
                    month.net >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {month.net >= 0 ? '+' : ''}
                  {formatCurrency(month.net)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Einnahmen</span>
                  <span className="ml-2 text-green-600">
                    {formatCurrency(month.income)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Ausgaben</span>
                  <span className="ml-2 text-red-600">
                    {formatCurrency(month.expenses)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Savings Rate Trend */}
      <Card>
        <CardHeader
          title="Sparquoten-Entwicklung"
          subtitle="Deine Sparquote über Zeit"
        />
        <div className="grid grid-cols-6 gap-2">
          {savingsRateTrend.map((month) => (
            <div key={month.monthISO} className="text-center">
              <div
                className={`h-24 rounded-t flex items-end justify-center ${
                  month.savingsRate >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                <div
                  className={`w-full rounded-t ${
                    month.savingsRate >= 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{
                    height: `${Math.min(Math.abs(month.savingsRate), 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">{month.monthName}</p>
              <p
                className={`text-sm font-medium ${
                  month.savingsRate >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {month.savingsRate.toFixed(0)}%
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
