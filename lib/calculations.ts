import { Transaction, MonthlySummary, CategoryGroup, ProjectionSettings, ProjectionMonth } from './types';
import { parseISO, isWithinInterval, startOfMonth, endOfMonth, addMonths, format } from 'date-fns';

export function computeMonthlySummary(transactions: Transaction[], monthISO: string): MonthlySummary {
  const [year, month] = monthISO.split('-').map(Number);
  const startDate = startOfMonth(new Date(year, month - 1));
  const endDate = endOfMonth(new Date(year, month - 1));

  const monthTransactions = transactions.filter(t => {
    const date = parseISO(t.dateISO);
    return isWithinInterval(date, { start: startDate, end: endDate });
  });

  const income = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const net = income - expenses;
  const savingsRate = income > 0 ? net / income : 0;

  return { income, expenses, net, savingsRate };
}

export function computeWeeklySummary(
  transactions: Transaction[],
  startISO: string,
  endISO: string
): { income: number; expenses: number; net: number } {
  const startDate = parseISO(startISO);
  const endDate = parseISO(endISO);

  const weekTransactions = transactions.filter(t => {
    const date = parseISO(t.dateISO);
    return isWithinInterval(date, { start: startDate, end: endDate });
  });

  const income = weekTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = weekTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return { income, expenses, net: income - expenses };
}

export function groupByCategory(
  transactions: Transaction[],
  type?: 'income' | 'expense'
): CategoryGroup {
  const filtered = type ? transactions.filter(t => t.type === type) : transactions;

  return filtered.reduce((groups, t) => {
    groups[t.category] = (groups[t.category] || 0) + t.amount;
    return groups;
  }, {} as CategoryGroup);
}

export function getTransactionsForMonth(transactions: Transaction[], monthISO: string): Transaction[] {
  const [year, month] = monthISO.split('-').map(Number);
  const startDate = startOfMonth(new Date(year, month - 1));
  const endDate = endOfMonth(new Date(year, month - 1));

  return transactions.filter(t => {
    const date = parseISO(t.dateISO);
    return isWithinInterval(date, { start: startDate, end: endDate });
  });
}

export function generateProjection(
  settings: ProjectionSettings,
  scenario: 'base' | 'best' | 'worst'
): ProjectionMonth[] {
  const months: ProjectionMonth[] = [];
  let cumulativeCash = settings.startingCash - settings.startingDebt;
  const multiplier = scenario === 'base'
    ? 1
    : scenario === 'best'
      ? settings.scenarioMultipliers.best
      : settings.scenarioMultipliers.worst;

  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const monthDate = addMonths(now, i);
    const monthLabel = format(monthDate, 'MMM yyyy');

    const growthFactor = Math.pow(1 + settings.growthRate / 100, i / 12);
    const income = settings.expectedIncome * growthFactor * multiplier;
    const expenses = (settings.fixedCosts + settings.variableCosts) *
      (scenario === 'worst' ? 1 / multiplier : 1);
    const net = income - expenses;
    cumulativeCash += net;

    months.push({
      month: monthLabel,
      income: Math.round(income),
      expenses: Math.round(expenses),
      net: Math.round(net),
      cumulativeCash: Math.round(cumulativeCash),
    });
  }

  return months;
}

export function getTopCategories(transactions: Transaction[], type: 'expense' | 'income', limit: number = 3): { category: string; amount: number }[] {
  const groups = groupByCategory(transactions, type);

  return Object.entries(groups)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export function calculateNetWorthOverTime(
  transactions: Transaction[],
  monthsBack: number = 6
): { month: string; netWorth: number }[] {
  const result: { month: string; netWorth: number }[] = [];
  let runningTotal = 0;

  const sortedTransactions = [...transactions].sort(
    (a, b) => parseISO(a.dateISO).getTime() - parseISO(b.dateISO).getTime()
  );

  const now = new Date();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const monthDate = addMonths(now, -i);
    const monthEnd = endOfMonth(monthDate);
    const monthISO = format(monthDate, 'yyyy-MM');

    const monthTransactions = sortedTransactions.filter(t => {
      const date = parseISO(t.dateISO);
      return date <= monthEnd;
    });

    runningTotal = monthTransactions.reduce((total, t) => {
      return t.type === 'income' ? total + t.amount : total - t.amount;
    }, 0);

    result.push({
      month: format(monthDate, 'MMM'),
      netWorth: runningTotal,
    });
  }

  return result;
}

export function getMonthlyIncomeExpenseData(
  transactions: Transaction[],
  monthsBack: number = 6
): { month: string; income: number; expenses: number }[] {
  const result: { month: string; income: number; expenses: number }[] = [];
  const now = new Date();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const monthDate = addMonths(now, -i);
    const monthISO = format(monthDate, 'yyyy-MM');
    const summary = computeMonthlySummary(transactions, monthISO);

    result.push({
      month: format(monthDate, 'MMM'),
      income: summary.income,
      expenses: summary.expenses,
    });
  }

  return result;
}
