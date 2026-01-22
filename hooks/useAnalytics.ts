'use client';

import { useMemo } from 'react';
import { Transaction, SpendingPattern, CategoryTrend, LifestyleInflationAlert, Budget } from '@/lib/types';
import { format, getDay, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

const DAY_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

interface UseAnalyticsProps {
  transactions: Transaction[];
  budgets?: Budget[];
  monthsBack?: number;
}

export function useAnalytics({ transactions, budgets = [], monthsBack = 6 }: UseAnalyticsProps) {
  // Spending patterns by day of week
  const spendingPatterns = useMemo((): SpendingPattern[] => {
    const patterns: Record<number, { total: number; count: number }> = {};

    // Initialize all days
    for (let i = 0; i < 7; i++) {
      patterns[i] = { total: 0, count: 0 };
    }

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const date = parseISO(t.dateISO);
        const dayOfWeek = getDay(date);
        patterns[dayOfWeek].total += t.amount;
        patterns[dayOfWeek].count += 1;
      });

    return Object.entries(patterns).map(([day, data]) => ({
      dayOfWeek: parseInt(day),
      dayName: DAY_NAMES[parseInt(day)],
      totalAmount: data.total,
      transactionCount: data.count,
      averageAmount: data.count > 0 ? data.total / data.count : 0,
    }));
  }, [transactions]);

  // Peak spending day
  const peakSpendingDay = useMemo(() => {
    return spendingPatterns.reduce((max, pattern) =>
      pattern.totalAmount > max.totalAmount ? pattern : max
    , spendingPatterns[0]);
  }, [spendingPatterns]);

  // Category trends over time
  const categoryTrends = useMemo((): CategoryTrend[] => {
    const today = new Date();
    const categories: Record<string, Record<string, number>> = {};

    // Group transactions by category and month
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const monthISO = t.dateISO.substring(0, 7); // YYYY-MM
        if (!categories[t.category]) {
          categories[t.category] = {};
        }
        if (!categories[t.category][monthISO]) {
          categories[t.category][monthISO] = 0;
        }
        categories[t.category][monthISO] += t.amount;
      });

    // Generate month list
    const months: string[] = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = subMonths(today, i);
      months.push(format(date, 'yyyy-MM'));
    }

    // Calculate trends
    return Object.entries(categories).map(([category, monthlyData]) => {
      const monthData = months.map(monthISO => ({
        monthISO,
        amount: monthlyData[monthISO] || 0,
      }));

      const amounts = monthData.map(m => m.amount).filter(a => a > 0);
      const averageMonthly = amounts.length > 0
        ? amounts.reduce((a, b) => a + b, 0) / amounts.length
        : 0;

      // Calculate trend (compare recent 3 months to previous 3 months)
      const recentMonths = monthData.slice(-3);
      const previousMonths = monthData.slice(-6, -3);
      const recentAvg = recentMonths.reduce((sum, m) => sum + m.amount, 0) / 3;
      const previousAvg = previousMonths.reduce((sum, m) => sum + m.amount, 0) / 3;
      const trend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

      return {
        category,
        months: monthData,
        trend,
        averageMonthly,
      };
    }).sort((a, b) => b.averageMonthly - a.averageMonthly);
  }, [transactions, monthsBack]);

  // Growing categories (positive trend)
  const growingCategories = useMemo(() => {
    return categoryTrends
      .filter(ct => ct.trend > 10) // More than 10% growth
      .sort((a, b) => b.trend - a.trend);
  }, [categoryTrends]);

  // Lifestyle inflation alerts
  const lifestyleInflationAlerts = useMemo((): LifestyleInflationAlert[] => {
    const alerts: LifestyleInflationAlert[] = [];

    categoryTrends.forEach(ct => {
      if (ct.trend > 20 && ct.averageMonthly > 50) { // More than 20% increase on significant categories
        const recentMonths = ct.months.slice(-3);
        const previousMonths = ct.months.slice(-6, -3);
        const currentAverage = recentMonths.reduce((sum, m) => sum + m.amount, 0) / 3;
        const previousAverage = previousMonths.reduce((sum, m) => sum + m.amount, 0) / 3;

        alerts.push({
          category: ct.category,
          previousAverage,
          currentAverage,
          increasePercent: ct.trend,
          message: `Deine Ausgaben für ${ct.category} sind um ${ct.trend.toFixed(0)}% gestiegen`,
        });
      }
    });

    return alerts.sort((a, b) => b.increasePercent - a.increasePercent);
  }, [categoryTrends]);

  // Calculate missed savings opportunities (what-if analysis)
  const missedSavingsOpportunities = useMemo(() => {
    if (budgets.length === 0) return [];

    const opportunities: { category: string; actualSpent: number; budgetAmount: number; potentialSavings: number; message: string }[] = [];
    const currentMonthISO = format(new Date(), 'yyyy-MM');

    // Get current month budgets
    const currentBudgets = budgets.filter(b => b.monthISO === currentMonthISO);

    // Calculate spent per category for current month
    const spentByCategory: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense' && t.dateISO.startsWith(currentMonthISO))
      .forEach(t => {
        if (!spentByCategory[t.category]) {
          spentByCategory[t.category] = 0;
        }
        spentByCategory[t.category] += t.amount;
      });

    currentBudgets.forEach(budget => {
      const spent = spentByCategory[budget.category] || 0;
      if (spent > budget.budgetAmount) {
        const overSpent = spent - budget.budgetAmount;
        opportunities.push({
          category: budget.category,
          actualSpent: spent,
          budgetAmount: budget.budgetAmount,
          potentialSavings: overSpent,
          message: `${overSpent.toFixed(2)}€ über Budget bei ${budget.category}`,
        });
      }
    });

    return opportunities.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }, [transactions, budgets]);

  // Total potential monthly savings
  const totalMissedSavings = useMemo(() => {
    return missedSavingsOpportunities.reduce((sum, o) => sum + o.potentialSavings, 0);
  }, [missedSavingsOpportunities]);

  // Top spending categories
  const topSpendingCategories = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!categoryTotals[t.category]) {
          categoryTotals[t.category] = 0;
        }
        categoryTotals[t.category] += t.amount;
      });

    return Object.entries(categoryTotals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [transactions]);

  // Monthly totals for trend chart
  const monthlyTotals = useMemo(() => {
    const today = new Date();
    const totals: { monthISO: string; monthName: string; income: number; expenses: number; net: number }[] = [];

    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = subMonths(today, i);
      const monthISO = format(date, 'yyyy-MM');
      const monthName = format(date, 'MMM yyyy', { locale: de });

      const monthTransactions = transactions.filter(t => t.dateISO.startsWith(monthISO));
      const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      totals.push({
        monthISO,
        monthName,
        income,
        expenses,
        net: income - expenses,
      });
    }

    return totals;
  }, [transactions, monthsBack]);

  // Average monthly expenses
  const averageMonthlyExpenses = useMemo(() => {
    const expenseMonths = monthlyTotals.filter(m => m.expenses > 0);
    if (expenseMonths.length === 0) return 0;
    return expenseMonths.reduce((sum, m) => sum + m.expenses, 0) / expenseMonths.length;
  }, [monthlyTotals]);

  // Savings rate trend
  const savingsRateTrend = useMemo(() => {
    return monthlyTotals.map(m => ({
      monthISO: m.monthISO,
      monthName: m.monthName,
      savingsRate: m.income > 0 ? ((m.income - m.expenses) / m.income) * 100 : 0,
    }));
  }, [monthlyTotals]);

  return {
    // Patterns
    spendingPatterns,
    peakSpendingDay,

    // Trends
    categoryTrends,
    growingCategories,
    monthlyTotals,
    savingsRateTrend,

    // Alerts
    lifestyleInflationAlerts,

    // Opportunities
    missedSavingsOpportunities,
    totalMissedSavings,

    // Summaries
    topSpendingCategories,
    averageMonthlyExpenses,
  };
}
