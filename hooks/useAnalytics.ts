'use client';

import { useMemo } from 'react';
import { Transaction, SpendingPattern, CategoryTrend, LifestyleInflationAlert, Budget } from '@/lib/types';
import { format, getDay, subMonths, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

const DAY_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

interface UseAnalyticsProps {
  transactions: Transaction[];
  budgets?: Budget[];
  monthsBack?: number;
}

export function useAnalytics({ transactions, budgets = [], monthsBack = 6 }: UseAnalyticsProps) {
  return useMemo(() => {
    const today = new Date();
    const currentMonthISO = format(today, 'yyyy-MM');
    const months: string[] = [];
    const monthsSet = new Set<string>();

    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = subMonths(today, i);
      const monthISO = format(date, 'yyyy-MM');
      months.push(monthISO);
      monthsSet.add(monthISO);
    }

    const patterns: Record<number, { total: number; count: number }> = {};
    for (let i = 0; i < 7; i++) {
      patterns[i] = { total: 0, count: 0 };
    }

    const categoryTotals: Record<string, number> = {};
    const categoryByMonth: Record<string, Record<string, number>> = {};
    const currentMonthExpensesByCategory: Record<string, number> = {};
    const monthlyTotalsMap: Record<string, { income: number; expenses: number }> = {};

    months.forEach((monthISO) => {
      monthlyTotalsMap[monthISO] = { income: 0, expenses: 0 };
    });

    transactions.forEach((t) => {
      const monthISO = t.dateISO.substring(0, 7);
      if (monthsSet.has(monthISO)) {
        if (t.type === 'income') {
          monthlyTotalsMap[monthISO].income += t.amount;
        } else {
          monthlyTotalsMap[monthISO].expenses += t.amount;
        }
      }

      if (t.type === 'expense') {
        const date = parseISO(t.dateISO);
        const dayOfWeek = getDay(date);
        patterns[dayOfWeek].total += t.amount;
        patterns[dayOfWeek].count += 1;

        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        if (!categoryByMonth[t.category]) {
          categoryByMonth[t.category] = {};
        }
        categoryByMonth[t.category][monthISO] =
          (categoryByMonth[t.category][monthISO] || 0) + t.amount;

        if (monthISO === currentMonthISO) {
          currentMonthExpensesByCategory[t.category] =
            (currentMonthExpensesByCategory[t.category] || 0) + t.amount;
        }
      }
    });

    const spendingPatterns: SpendingPattern[] = Object.entries(patterns).map(([day, data]) => ({
      dayOfWeek: parseInt(day, 10),
      dayName: DAY_NAMES[parseInt(day, 10)],
      totalAmount: data.total,
      transactionCount: data.count,
      averageAmount: data.count > 0 ? data.total / data.count : 0,
    }));

    let peakSpendingDay = spendingPatterns[0];
    for (const pattern of spendingPatterns) {
      if (pattern.totalAmount > peakSpendingDay.totalAmount) {
        peakSpendingDay = pattern;
      }
    }

    const categoryTrends: CategoryTrend[] = Object.entries(categoryByMonth).map(([category, monthlyData]) => {
      const monthData = months.map(monthISO => ({
        monthISO,
        amount: monthlyData[monthISO] || 0,
      }));

      let amountSum = 0;
      let amountCount = 0;
      for (const month of monthData) {
        if (month.amount <= 0) continue;
        amountSum += month.amount;
        amountCount += 1;
      }
      const averageMonthly = amountCount > 0 ? amountSum / amountCount : 0;

      const recentMonths = monthData.slice(-3);
      const previousMonths = monthData.slice(-6, -3);
      let recentAvg = 0;
      let previousAvg = 0;
      for (const month of recentMonths) {
        recentAvg += month.amount;
      }
      for (const month of previousMonths) {
        previousAvg += month.amount;
      }
      recentAvg /= 3;
      previousAvg /= 3;
      const trend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

      return {
        category,
        months: monthData,
        trend,
        averageMonthly,
      };
    }).sort((a, b) => b.averageMonthly - a.averageMonthly);

    const growingCategories = categoryTrends
      .filter(ct => ct.trend > 10)
      .sort((a, b) => b.trend - a.trend);

    const lifestyleInflationAlerts: LifestyleInflationAlert[] = [];
    categoryTrends.forEach(ct => {
      if (ct.trend > 20 && ct.averageMonthly > 50) {
        const recentMonths = ct.months.slice(-3);
        const previousMonths = ct.months.slice(-6, -3);
        let currentAverage = 0;
        let previousAverage = 0;
        for (const month of recentMonths) {
          currentAverage += month.amount;
        }
        for (const month of previousMonths) {
          previousAverage += month.amount;
        }
        currentAverage /= 3;
        previousAverage /= 3;

        lifestyleInflationAlerts.push({
          category: ct.category,
          previousAverage,
          currentAverage,
          increasePercent: ct.trend,
          message: `Deine Ausgaben für ${ct.category} sind um ${ct.trend.toFixed(0)}% gestiegen`,
        });
      }
    });

    const missedSavingsOpportunities: {
      category: string;
      actualSpent: number;
      budgetAmount: number;
      potentialSavings: number;
      message: string;
    }[] = [];

    const currentBudgets = budgets.filter(b => b.monthISO === currentMonthISO);
    currentBudgets.forEach(budget => {
      const spent = currentMonthExpensesByCategory[budget.category] || 0;
      if (spent > budget.budgetAmount) {
        const overSpent = spent - budget.budgetAmount;
        missedSavingsOpportunities.push({
          category: budget.category,
          actualSpent: spent,
          budgetAmount: budget.budgetAmount,
          potentialSavings: overSpent,
          message: `${overSpent.toFixed(2)}€ über Budget bei ${budget.category}`,
        });
      }
    });
    missedSavingsOpportunities.sort((a, b) => b.potentialSavings - a.potentialSavings);

    let totalMissedSavings = 0;
    for (const opportunity of missedSavingsOpportunities) {
      totalMissedSavings += opportunity.potentialSavings;
    }

    let totalBudget = 0;
    let totalSpent = 0;
    for (const budget of currentBudgets) {
      totalBudget += budget.budgetAmount;
      totalSpent += currentMonthExpensesByCategory[budget.category] || 0;
    }

    const budgetSummary = {
      totalBudget,
      totalSpent,
      variance: totalSpent - totalBudget,
    };

    const topSpendingCategories = Object.entries(categoryTotals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const monthlyTotals = months.map((monthISO) => {
      const monthName = format(parseISO(`${monthISO}-01`), 'MMM yyyy', { locale: de });
      const income = monthlyTotalsMap[monthISO].income;
      const expenses = monthlyTotalsMap[monthISO].expenses;
      return {
        monthISO,
        monthName,
        income,
        expenses,
        net: income - expenses,
      };
    });

    let expenseMonthsCount = 0;
    let expenseMonthsTotal = 0;
    for (const month of monthlyTotals) {
      if (month.expenses <= 0) continue;
      expenseMonthsCount += 1;
      expenseMonthsTotal += month.expenses;
    }
    const averageMonthlyExpenses = expenseMonthsCount > 0
      ? expenseMonthsTotal / expenseMonthsCount
      : 0;

    const savingsRateTrend = monthlyTotals.map(m => ({
      monthISO: m.monthISO,
      monthName: m.monthName,
      savingsRate: m.income > 0 ? ((m.income - m.expenses) / m.income) * 100 : 0,
    }));

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
      budgetSummary,

      // Summaries
      topSpendingCategories,
      averageMonthlyExpenses,
    };
  }, [transactions, budgets, monthsBack]);
}
