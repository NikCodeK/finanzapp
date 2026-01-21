import { supabase } from './supabase';
import {
  Transaction,
  TransactionFilters,
  WeeklyReport,
  Budget,
  ProjectionSettings,
  IncomeSource,
  FixedCost,
  VariableCostEstimate,
  Debt,
  Assets,
  Goal,
  EnhancedWeeklyReport,
  QuarterlyBonusStatus,
  TransactionTemplate,
  CreditCard,
  CreditCardBalance,
  FinancialSnapshot,
  YearlyIncomeRecord,
} from './types';

type TransactionPage = {
  data: Transaction[];
  total: number;
};

function mapTransaction(row: any): Transaction {
  return {
    id: row.id,
    dateISO: row.date_iso,
    amount: parseFloat(row.amount),
    type: row.type,
    category: row.category,
    account: row.account,
    recurring: row.recurring,
    note: row.note || '',
  };
}

function applyTransactionFilters(
  query: any,
  filters?: TransactionFilters
) {
  if (!filters) return query;

  if (filters.type) {
    query = query.eq('type', filters.type);
  }
  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }
  if (filters.account && filters.account !== 'all') {
    query = query.eq('account', filters.account);
  }
  if (filters.startDateISO) {
    query = query.gte('date_iso', filters.startDateISO);
  }
  if (filters.endDateISO) {
    query = query.lte('date_iso', filters.endDateISO);
  }
  if (filters.search && filters.search.trim().length > 0) {
    const escaped = filters.search.trim().replace(/,/g, '');
    query = query.or(
      `note.ilike.%${escaped}%,category.ilike.%${escaped}%`
    );
  }

  return query;
}

// ============================================
// TRANSACTIONS
// ============================================

export async function getTransactionsPage(
  filters?: TransactionFilters,
  limit = 50,
  offset = 0
): Promise<TransactionPage> {
  let query = supabase
    .from('transactions')
    .select(
      'id, date_iso, amount, type, category, account, recurring, note',
      { count: 'exact' }
    )
    .order('date_iso', { ascending: false });

  query = applyTransactionFilters(query, filters);
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching transactions:', error);
    return { data: [], total: 0 };
  }

  return {
    data: (data || []).map(mapTransaction),
    total: count || 0,
  };
}

export async function getTransactionsByDateRange(
  startISO: string,
  endISO: string,
  filters?: TransactionFilters
): Promise<Transaction[]> {
  let query = supabase
    .from('transactions')
    .select('id, date_iso, amount, type, category, account, recurring, note')
    .order('date_iso', { ascending: false })
    .gte('date_iso', startISO)
    .lte('date_iso', endISO);

  query = applyTransactionFilters(query, filters);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching transactions by date range:', error);
    return [];
  }

  return (data || []).map(mapTransaction);
}

export async function addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      date_iso: transaction.dateISO,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      account: transaction.account,
      recurring: transaction.recurring,
      note: transaction.note,
    })
    .select('id, date_iso, amount, type, category, account, recurring, note')
    .single();

  if (error) {
    console.error('Error adding transaction:', error);
    return null;
  }

  return mapTransaction(data);
}

export async function updateTransaction(transaction: Transaction): Promise<boolean> {
  const { error } = await supabase
    .from('transactions')
    .update({
      date_iso: transaction.dateISO,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      account: transaction.account,
      recurring: transaction.recurring,
      note: transaction.note,
    })
    .eq('id', transaction.id);

  if (error) {
    console.error('Error updating transaction:', error);
    return false;
  }
  return true;
}

export async function deleteTransaction(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }
  return true;
}

// ============================================
// WEEKLY REPORTS
// ============================================

export async function getWeeklyReports(): Promise<EnhancedWeeklyReport[]> {
  const { data, error } = await supabase
    .from('weekly_reports')
    .select(
      'id, week_start_iso, week_end_iso, income, expenses, net, top3, insights, next_decision, mood, biggest_win, biggest_challenge, savings_this_week, goal_contributions, previous_week_income, previous_week_expenses, income_change, expense_change'
    )
    .order('week_start_iso', { ascending: false });

  if (error) {
    console.error('Error fetching weekly reports:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    weekStartISO: row.week_start_iso,
    weekEndISO: row.week_end_iso,
    income: parseFloat(row.income),
    expenses: parseFloat(row.expenses),
    net: parseFloat(row.net),
    top3: row.top3 || '',
    insights: row.insights || '',
    nextDecision: row.next_decision || '',
    mood: row.mood as 1 | 2 | 3 | 4 | 5,
    biggestWin: row.biggest_win,
    biggestChallenge: row.biggest_challenge,
    savingsThisWeek: row.savings_this_week ? parseFloat(row.savings_this_week) : undefined,
    goalContributions: row.goal_contributions,
    previousWeekIncome: row.previous_week_income ? parseFloat(row.previous_week_income) : undefined,
    previousWeekExpenses: row.previous_week_expenses ? parseFloat(row.previous_week_expenses) : undefined,
    incomeChange: row.income_change ? parseFloat(row.income_change) : undefined,
    expenseChange: row.expense_change ? parseFloat(row.expense_change) : undefined,
  }));
}

export async function addWeeklyReport(report: Omit<EnhancedWeeklyReport, 'id'>): Promise<EnhancedWeeklyReport | null> {
  const { data, error } = await supabase
    .from('weekly_reports')
    .insert({
      week_start_iso: report.weekStartISO,
      week_end_iso: report.weekEndISO,
      income: report.income,
      expenses: report.expenses,
      net: report.net,
      top3: report.top3,
      insights: report.insights,
      next_decision: report.nextDecision,
      mood: report.mood,
      biggest_win: report.biggestWin,
      biggest_challenge: report.biggestChallenge,
      savings_this_week: report.savingsThisWeek,
      goal_contributions: report.goalContributions,
      previous_week_income: report.previousWeekIncome,
      previous_week_expenses: report.previousWeekExpenses,
      income_change: report.incomeChange,
      expense_change: report.expenseChange,
    })
    .select(
      'id, week_start_iso, week_end_iso, income, expenses, net, top3, insights, next_decision, mood, biggest_win, biggest_challenge, savings_this_week, goal_contributions'
    )
    .single();

  if (error) {
    console.error('Error adding weekly report:', error);
    return null;
  }

  return {
    id: data.id,
    weekStartISO: data.week_start_iso,
    weekEndISO: data.week_end_iso,
    income: parseFloat(data.income),
    expenses: parseFloat(data.expenses),
    net: parseFloat(data.net),
    top3: data.top3 || '',
    insights: data.insights || '',
    nextDecision: data.next_decision || '',
    mood: data.mood as 1 | 2 | 3 | 4 | 5,
    biggestWin: data.biggest_win,
    biggestChallenge: data.biggest_challenge,
    savingsThisWeek: data.savings_this_week ? parseFloat(data.savings_this_week) : undefined,
    goalContributions: data.goal_contributions,
  };
}

export async function updateWeeklyReport(report: EnhancedWeeklyReport): Promise<boolean> {
  const { error } = await supabase
    .from('weekly_reports')
    .update({
      week_start_iso: report.weekStartISO,
      week_end_iso: report.weekEndISO,
      income: report.income,
      expenses: report.expenses,
      net: report.net,
      top3: report.top3,
      insights: report.insights,
      next_decision: report.nextDecision,
      mood: report.mood,
      biggest_win: report.biggestWin,
      biggest_challenge: report.biggestChallenge,
      savings_this_week: report.savingsThisWeek,
      goal_contributions: report.goalContributions,
    })
    .eq('id', report.id);

  if (error) {
    console.error('Error updating weekly report:', error);
    return false;
  }
  return true;
}

export async function deleteWeeklyReport(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('weekly_reports')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting weekly report:', error);
    return false;
  }
  return true;
}

// ============================================
// INCOME SOURCES
// ============================================

export async function getIncomeSources(): Promise<IncomeSource[]> {
  const { data, error } = await supabase
    .from('income_sources')
    .select('id, name, amount, frequency, is_active, confirmed_quarters, note')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching income sources:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    amount: parseFloat(row.amount),
    frequency: row.frequency,
    isActive: row.is_active,
    confirmedQuarters: row.confirmed_quarters as QuarterlyBonusStatus | undefined,
    note: row.note,
  }));
}

export async function addIncomeSource(source: Omit<IncomeSource, 'id'>): Promise<IncomeSource | null> {
  const { data, error } = await supabase
    .from('income_sources')
    .insert({
      name: source.name,
      amount: source.amount,
      frequency: source.frequency,
      is_active: source.isActive,
      confirmed_quarters: source.confirmedQuarters || { Q1: false, Q2: false, Q3: false, Q4: false },
      note: source.note,
    })
    .select('id, name, amount, frequency, is_active, confirmed_quarters, note')
    .single();

  if (error) {
    console.error('Error adding income source:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    amount: parseFloat(data.amount),
    frequency: data.frequency,
    isActive: data.is_active,
    confirmedQuarters: data.confirmed_quarters as QuarterlyBonusStatus | undefined,
    note: data.note,
  };
}

export async function updateIncomeSource(source: IncomeSource): Promise<boolean> {
  const { error } = await supabase
    .from('income_sources')
    .update({
      name: source.name,
      amount: source.amount,
      frequency: source.frequency,
      is_active: source.isActive,
      confirmed_quarters: source.confirmedQuarters || { Q1: false, Q2: false, Q3: false, Q4: false },
      note: source.note,
    })
    .eq('id', source.id);

  if (error) {
    console.error('Error updating income source:', error);
    return false;
  }
  return true;
}

export async function deleteIncomeSource(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('income_sources')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting income source:', error);
    return false;
  }
  return true;
}

// ============================================
// FIXED COSTS
// ============================================

export async function getFixedCosts(): Promise<FixedCost[]> {
  const { data, error } = await supabase
    .from('fixed_costs')
    .select('id, name, category, amount, frequency, is_active, note')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching fixed costs:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    category: row.category,
    amount: parseFloat(row.amount),
    frequency: row.frequency,
    isActive: row.is_active,
    note: row.note,
  }));
}

export async function addFixedCost(cost: Omit<FixedCost, 'id'>): Promise<FixedCost | null> {
  const { data, error } = await supabase
    .from('fixed_costs')
    .insert({
      name: cost.name,
      category: cost.category,
      amount: cost.amount,
      frequency: cost.frequency,
      is_active: cost.isActive,
      note: cost.note,
    })
    .select('id, name, category, amount, frequency, is_active, note')
    .single();

  if (error) {
    console.error('Error adding fixed cost:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    amount: parseFloat(data.amount),
    frequency: data.frequency,
    isActive: data.is_active,
    note: data.note,
  };
}

export async function updateFixedCost(cost: FixedCost): Promise<boolean> {
  const { error } = await supabase
    .from('fixed_costs')
    .update({
      name: cost.name,
      category: cost.category,
      amount: cost.amount,
      frequency: cost.frequency,
      is_active: cost.isActive,
      note: cost.note,
    })
    .eq('id', cost.id);

  if (error) {
    console.error('Error updating fixed cost:', error);
    return false;
  }
  return true;
}

export async function deleteFixedCost(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('fixed_costs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting fixed cost:', error);
    return false;
  }
  return true;
}

// ============================================
// VARIABLE COSTS
// ============================================

export async function getVariableCosts(): Promise<VariableCostEstimate[]> {
  const { data, error } = await supabase
    .from('variable_costs')
    .select('id, category, estimated_monthly, note')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching variable costs:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    category: row.category,
    estimatedMonthly: parseFloat(row.estimated_monthly),
    note: row.note,
  }));
}

export async function addVariableCost(cost: Omit<VariableCostEstimate, 'id'>): Promise<VariableCostEstimate | null> {
  const { data, error } = await supabase
    .from('variable_costs')
    .insert({
      category: cost.category,
      estimated_monthly: cost.estimatedMonthly,
      note: cost.note,
    })
    .select('id, category, estimated_monthly, note')
    .single();

  if (error) {
    console.error('Error adding variable cost:', error);
    return null;
  }

  return {
    id: data.id,
    category: data.category,
    estimatedMonthly: parseFloat(data.estimated_monthly),
    note: data.note,
  };
}

export async function updateVariableCost(cost: VariableCostEstimate): Promise<boolean> {
  const { error } = await supabase
    .from('variable_costs')
    .update({
      category: cost.category,
      estimated_monthly: cost.estimatedMonthly,
      note: cost.note,
    })
    .eq('id', cost.id);

  if (error) {
    console.error('Error updating variable cost:', error);
    return false;
  }
  return true;
}

export async function deleteVariableCost(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('variable_costs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting variable cost:', error);
    return false;
  }
  return true;
}

// ============================================
// DEBTS
// ============================================

export async function getDebts(): Promise<Debt[]> {
  const { data, error } = await supabase
    .from('debts')
    .select('id, name, type, original_amount, current_balance, interest_rate, monthly_payment, is_variable_payment, min_payment, max_payment, start_date_iso, note')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching debts:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    type: row.type,
    originalAmount: parseFloat(row.original_amount),
    currentBalance: parseFloat(row.current_balance),
    interestRate: parseFloat(row.interest_rate),
    monthlyPayment: parseFloat(row.monthly_payment),
    isVariablePayment: row.is_variable_payment || false,
    minPayment: row.min_payment ? parseFloat(row.min_payment) : undefined,
    maxPayment: row.max_payment ? parseFloat(row.max_payment) : undefined,
    startDateISO: row.start_date_iso,
    note: row.note,
  }));
}

export async function addDebt(debt: Omit<Debt, 'id'>): Promise<Debt | null> {
  const { data, error } = await supabase
    .from('debts')
    .insert({
      name: debt.name,
      type: debt.type,
      original_amount: debt.originalAmount,
      current_balance: debt.currentBalance,
      interest_rate: debt.interestRate,
      monthly_payment: debt.monthlyPayment,
      is_variable_payment: debt.isVariablePayment || false,
      min_payment: debt.minPayment,
      max_payment: debt.maxPayment,
      start_date_iso: debt.startDateISO,
      note: debt.note,
    })
    .select('id, name, type, original_amount, current_balance, interest_rate, monthly_payment, is_variable_payment, min_payment, max_payment, start_date_iso, note')
    .single();

  if (error) {
    console.error('Error adding debt:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    type: data.type,
    originalAmount: parseFloat(data.original_amount),
    currentBalance: parseFloat(data.current_balance),
    interestRate: parseFloat(data.interest_rate),
    monthlyPayment: parseFloat(data.monthly_payment),
    isVariablePayment: data.is_variable_payment || false,
    minPayment: data.min_payment ? parseFloat(data.min_payment) : undefined,
    maxPayment: data.max_payment ? parseFloat(data.max_payment) : undefined,
    startDateISO: data.start_date_iso,
    note: data.note,
  };
}

export async function updateDebt(debt: Debt): Promise<boolean> {
  const { error } = await supabase
    .from('debts')
    .update({
      name: debt.name,
      type: debt.type,
      original_amount: debt.originalAmount,
      current_balance: debt.currentBalance,
      interest_rate: debt.interestRate,
      monthly_payment: debt.monthlyPayment,
      is_variable_payment: debt.isVariablePayment || false,
      min_payment: debt.minPayment,
      max_payment: debt.maxPayment,
      start_date_iso: debt.startDateISO,
      note: debt.note,
    })
    .eq('id', debt.id);

  if (error) {
    console.error('Error updating debt:', error);
    return false;
  }
  return true;
}

export async function deleteDebt(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting debt:', error);
    return false;
  }
  return true;
}

// ============================================
// ASSETS
// ============================================

export async function getAssets(): Promise<Assets> {
  const { data, error } = await supabase
    .from('assets')
    .select('id, savings, investments, other')
    .limit(1)
    .single();

  if (error || !data) {
    return { savings: 0, investments: 0, other: 0 };
  }

  return {
    savings: parseFloat(data.savings),
    investments: parseFloat(data.investments),
    other: parseFloat(data.other),
  };
}

export async function saveAssets(assets: Assets): Promise<boolean> {
  // First check if assets row exists
  const { data: existing } = await supabase
    .from('assets')
    .select('id')
    .limit(1)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('assets')
      .update({
        savings: assets.savings,
        investments: assets.investments,
        other: assets.other,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (error) {
      console.error('Error updating assets:', error);
      return false;
    }
  } else {
    const { error } = await supabase
      .from('assets')
      .insert({
        savings: assets.savings,
        investments: assets.investments,
        other: assets.other,
      });

    if (error) {
      console.error('Error inserting assets:', error);
      return false;
    }
  }
  return true;
}

// ============================================
// GOALS
// ============================================

export async function getGoals(): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('id, year, name, type, target_amount, current_amount, start_amount, deadline_iso, created_at_iso, status, priority, linked_debt_id, note, milestones')
    .order('priority', { ascending: true })
    .order('deadline_iso', { ascending: true });

  if (error) {
    console.error('Error fetching goals:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    year: row.year,
    name: row.name,
    type: row.type,
    targetAmount: parseFloat(row.target_amount),
    currentAmount: parseFloat(row.current_amount),
    startAmount: parseFloat(row.start_amount),
    deadlineISO: row.deadline_iso,
    createdAtISO: row.created_at_iso,
    status: row.status,
    priority: row.priority as 1 | 2 | 3,
    linkedDebtId: row.linked_debt_id,
    note: row.note,
    milestones: row.milestones || undefined,
  }));
}

export async function getGoalsByYear(year: number): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('id, year, name, type, target_amount, current_amount, start_amount, deadline_iso, created_at_iso, status, priority, linked_debt_id, note, milestones')
    .eq('year', year)
    .order('priority', { ascending: true })
    .order('deadline_iso', { ascending: true });

  if (error) {
    console.error('Error fetching goals by year:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    year: row.year,
    name: row.name,
    type: row.type,
    targetAmount: parseFloat(row.target_amount),
    currentAmount: parseFloat(row.current_amount),
    startAmount: parseFloat(row.start_amount),
    deadlineISO: row.deadline_iso,
    createdAtISO: row.created_at_iso,
    status: row.status,
    priority: row.priority as 1 | 2 | 3,
    linkedDebtId: row.linked_debt_id,
    note: row.note,
    milestones: row.milestones || undefined,
  }));
}

export async function addGoal(goal: Omit<Goal, 'id'>): Promise<Goal | null> {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      year: goal.year,
      name: goal.name,
      type: goal.type,
      target_amount: goal.targetAmount,
      current_amount: goal.currentAmount,
      start_amount: goal.startAmount,
      deadline_iso: goal.deadlineISO,
      created_at_iso: goal.createdAtISO,
      status: goal.status,
      priority: goal.priority,
      linked_debt_id: goal.linkedDebtId,
      note: goal.note,
      milestones: goal.milestones || null,
    })
    .select('id, year, name, type, target_amount, current_amount, start_amount, deadline_iso, created_at_iso, status, priority, linked_debt_id, note, milestones')
    .single();

  if (error) {
    console.error('Error adding goal:', error);
    return null;
  }

  return {
    id: data.id,
    year: data.year,
    name: data.name,
    type: data.type,
    targetAmount: parseFloat(data.target_amount),
    currentAmount: parseFloat(data.current_amount),
    startAmount: parseFloat(data.start_amount),
    deadlineISO: data.deadline_iso,
    createdAtISO: data.created_at_iso,
    status: data.status,
    priority: data.priority as 1 | 2 | 3,
    linkedDebtId: data.linked_debt_id,
    note: data.note,
    milestones: data.milestones || undefined,
  };
}

export async function updateGoal(goal: Goal): Promise<boolean> {
  const { error } = await supabase
    .from('goals')
    .update({
      year: goal.year,
      name: goal.name,
      type: goal.type,
      target_amount: goal.targetAmount,
      current_amount: goal.currentAmount,
      start_amount: goal.startAmount,
      deadline_iso: goal.deadlineISO,
      status: goal.status,
      priority: goal.priority,
      linked_debt_id: goal.linkedDebtId,
      note: goal.note,
      milestones: goal.milestones || null,
    })
    .eq('id', goal.id);

  if (error) {
    console.error('Error updating goal:', error);
    return false;
  }
  return true;
}

export async function deleteGoal(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting goal:', error);
    return false;
  }
  return true;
}

// ============================================
// PROJECTION SETTINGS
// ============================================

export async function getProjectionSettings(): Promise<ProjectionSettings> {
  const { data, error } = await supabase
    .from('projection_settings')
    .select('id, expected_income, fixed_costs, variable_costs, growth_rate, starting_cash, starting_debt, scenario_multipliers')
    .limit(1)
    .single();

  if (error || !data) {
    return {
      expectedIncome: 3000,
      fixedCosts: 1500,
      variableCosts: 500,
      growthRate: 2,
      startingCash: 5000,
      startingDebt: 0,
      scenarioMultipliers: { best: 1.1, worst: 0.9 },
    };
  }

  return {
    expectedIncome: parseFloat(data.expected_income),
    fixedCosts: parseFloat(data.fixed_costs),
    variableCosts: parseFloat(data.variable_costs),
    growthRate: parseFloat(data.growth_rate),
    startingCash: parseFloat(data.starting_cash),
    startingDebt: parseFloat(data.starting_debt),
    scenarioMultipliers: data.scenario_multipliers || { best: 1.1, worst: 0.9 },
  };
}

export async function saveProjectionSettings(settings: ProjectionSettings): Promise<boolean> {
  const { data: existing } = await supabase
    .from('projection_settings')
    .select('id')
    .limit(1)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('projection_settings')
      .update({
        expected_income: settings.expectedIncome,
        fixed_costs: settings.fixedCosts,
        variable_costs: settings.variableCosts,
        growth_rate: settings.growthRate,
        starting_cash: settings.startingCash,
        starting_debt: settings.startingDebt,
        scenario_multipliers: settings.scenarioMultipliers,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (error) {
      console.error('Error updating projection settings:', error);
      return false;
    }
  } else {
    const { error } = await supabase
      .from('projection_settings')
      .insert({
        expected_income: settings.expectedIncome,
        fixed_costs: settings.fixedCosts,
        variable_costs: settings.variableCosts,
        growth_rate: settings.growthRate,
        starting_cash: settings.startingCash,
        starting_debt: settings.startingDebt,
        scenario_multipliers: settings.scenarioMultipliers,
      });

    if (error) {
      console.error('Error inserting projection settings:', error);
      return false;
    }
  }
  return true;
}

// ============================================
// BUDGETS
// ============================================

export async function getBudgets(): Promise<Budget[]> {
  const { data, error } = await supabase
    .from('budgets')
    .select('id, month_iso, category, budget_amount')
    .order('month_iso', { ascending: false });

  if (error) {
    console.error('Error fetching budgets:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    monthISO: row.month_iso,
    category: row.category,
    budgetAmount: parseFloat(row.budget_amount),
  }));
}

export async function addBudget(budget: Omit<Budget, 'id'>): Promise<Budget | null> {
  const { data, error } = await supabase
    .from('budgets')
    .insert({
      month_iso: budget.monthISO,
      category: budget.category,
      budget_amount: budget.budgetAmount,
    })
    .select('id, month_iso, category, budget_amount')
    .single();

  if (error) {
    console.error('Error adding budget:', error);
    return null;
  }

  return {
    id: data.id,
    monthISO: data.month_iso,
    category: data.category,
    budgetAmount: parseFloat(data.budget_amount),
  };
}

export async function updateBudget(budget: Budget): Promise<boolean> {
  const { error } = await supabase
    .from('budgets')
    .update({
      month_iso: budget.monthISO,
      category: budget.category,
      budget_amount: budget.budgetAmount,
    })
    .eq('id', budget.id);

  if (error) {
    console.error('Error updating budget:', error);
    return false;
  }
  return true;
}

export async function deleteBudget(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting budget:', error);
    return false;
  }
  return true;
}

// ============================================
// TRANSACTION TEMPLATES (localStorage)
// ============================================

const TEMPLATES_STORAGE_KEY = 'finanzapp_transaction_templates';

function generateTemplateId(): string {
  return `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getTransactionTemplates(): TransactionTemplate[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as TransactionTemplate[];
  } catch (error) {
    console.error('Error reading templates from localStorage:', error);
    return [];
  }
}

export function addTransactionTemplate(
  template: Omit<TransactionTemplate, 'id'>
): TransactionTemplate | null {
  if (typeof window === 'undefined') return null;

  try {
    const templates = getTransactionTemplates();
    const newTemplate: TransactionTemplate = {
      ...template,
      id: generateTemplateId(),
    };
    templates.push(newTemplate);
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    return newTemplate;
  } catch (error) {
    console.error('Error adding template to localStorage:', error);
    return null;
  }
}

export function updateTransactionTemplate(
  template: TransactionTemplate
): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const templates = getTransactionTemplates();
    const index = templates.findIndex((t) => t.id === template.id);
    if (index === -1) return false;

    templates[index] = template;
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    return true;
  } catch (error) {
    console.error('Error updating template in localStorage:', error);
    return false;
  }
}

export function deleteTransactionTemplate(id: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const templates = getTransactionTemplates();
    const filtered = templates.filter((t) => t.id !== id);
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting template from localStorage:', error);
    return false;
  }
}

// ============================================
// CREDIT CARDS
// ============================================

export async function getCreditCards(): Promise<CreditCard[]> {
  const { data, error } = await supabase
    .from('credit_cards')
    .select('id, name, bank, credit_limit, current_balance, interest_rate, monthly_fee, annual_fee, billing_day, is_active, note')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching credit cards:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    bank: row.bank,
    creditLimit: parseFloat(row.credit_limit),
    currentBalance: parseFloat(row.current_balance),
    interestRate: parseFloat(row.interest_rate),
    monthlyFee: parseFloat(row.monthly_fee),
    annualFee: parseFloat(row.annual_fee),
    billingDay: row.billing_day,
    isActive: row.is_active,
    note: row.note,
  }));
}

export async function addCreditCard(card: Omit<CreditCard, 'id'>): Promise<CreditCard | null> {
  const { data, error } = await supabase
    .from('credit_cards')
    .insert({
      name: card.name,
      bank: card.bank,
      credit_limit: card.creditLimit,
      current_balance: card.currentBalance,
      interest_rate: card.interestRate,
      monthly_fee: card.monthlyFee,
      annual_fee: card.annualFee,
      billing_day: card.billingDay,
      is_active: card.isActive,
      note: card.note,
    })
    .select('id, name, bank, credit_limit, current_balance, interest_rate, monthly_fee, annual_fee, billing_day, is_active, note')
    .single();

  if (error) {
    console.error('Error adding credit card:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    bank: data.bank,
    creditLimit: parseFloat(data.credit_limit),
    currentBalance: parseFloat(data.current_balance),
    interestRate: parseFloat(data.interest_rate),
    monthlyFee: parseFloat(data.monthly_fee),
    annualFee: parseFloat(data.annual_fee),
    billingDay: data.billing_day,
    isActive: data.is_active,
    note: data.note,
  };
}

export async function updateCreditCard(card: CreditCard): Promise<boolean> {
  const { error } = await supabase
    .from('credit_cards')
    .update({
      name: card.name,
      bank: card.bank,
      credit_limit: card.creditLimit,
      current_balance: card.currentBalance,
      interest_rate: card.interestRate,
      monthly_fee: card.monthlyFee,
      annual_fee: card.annualFee,
      billing_day: card.billingDay,
      is_active: card.isActive,
      note: card.note,
    })
    .eq('id', card.id);

  if (error) {
    console.error('Error updating credit card:', error);
    return false;
  }
  return true;
}

export async function deleteCreditCard(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('credit_cards')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting credit card:', error);
    return false;
  }
  return true;
}

// ============================================
// CREDIT CARD BALANCES
// ============================================

export async function getCreditCardBalances(creditCardId: string): Promise<CreditCardBalance[]> {
  const { data, error } = await supabase
    .from('credit_card_balances')
    .select('id, credit_card_id, balance, recorded_at_iso, note')
    .eq('credit_card_id', creditCardId)
    .order('recorded_at_iso', { ascending: false });

  if (error) {
    console.error('Error fetching credit card balances:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    creditCardId: row.credit_card_id,
    balance: parseFloat(row.balance),
    recordedAtISO: row.recorded_at_iso,
    note: row.note,
  }));
}

export async function addCreditCardBalance(balance: Omit<CreditCardBalance, 'id'>): Promise<CreditCardBalance | null> {
  const { data, error } = await supabase
    .from('credit_card_balances')
    .insert({
      credit_card_id: balance.creditCardId,
      balance: balance.balance,
      recorded_at_iso: balance.recordedAtISO,
      note: balance.note,
    })
    .select('id, credit_card_id, balance, recorded_at_iso, note')
    .single();

  if (error) {
    console.error('Error adding credit card balance:', error);
    return null;
  }

  // Update the current balance on the credit card
  await supabase
    .from('credit_cards')
    .update({ current_balance: balance.balance })
    .eq('id', balance.creditCardId);

  return {
    id: data.id,
    creditCardId: data.credit_card_id,
    balance: parseFloat(data.balance),
    recordedAtISO: data.recorded_at_iso,
    note: data.note,
  };
}

export async function deleteCreditCardBalance(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('credit_card_balances')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting credit card balance:', error);
    return false;
  }
  return true;
}

// ============================================
// FINANCIAL SNAPSHOTS
// ============================================

export async function getFinancialSnapshots(): Promise<FinancialSnapshot[]> {
  const { data, error } = await supabase
    .from('financial_snapshots')
    .select('*')
    .order('snapshot_date_iso', { ascending: false });

  if (error) {
    console.error('Error fetching financial snapshots:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    createdAtISO: row.created_at,
    snapshotDateISO: row.snapshot_date_iso,
    name: row.name,
    incomeSources: row.income_sources || [],
    fixedCosts: row.fixed_costs || [],
    variableCosts: row.variable_costs || [],
    debts: row.debts || [],
    creditCards: row.credit_cards || [],
    assets: row.assets || { savings: 0, investments: 0, other: 0 },
    monthlyIncome: parseFloat(row.monthly_income),
    monthlyFixedCosts: parseFloat(row.monthly_fixed_costs),
    monthlyVariableCosts: parseFloat(row.monthly_variable_costs),
    totalDebt: parseFloat(row.total_debt),
    totalAssets: parseFloat(row.total_assets),
    netWorth: parseFloat(row.net_worth),
    healthScore: row.health_score,
    note: row.note,
  }));
}

export async function addFinancialSnapshot(snapshot: Omit<FinancialSnapshot, 'id' | 'createdAtISO'>): Promise<FinancialSnapshot | null> {
  const { data, error } = await supabase
    .from('financial_snapshots')
    .insert({
      snapshot_date_iso: snapshot.snapshotDateISO,
      name: snapshot.name,
      income_sources: snapshot.incomeSources,
      fixed_costs: snapshot.fixedCosts,
      variable_costs: snapshot.variableCosts,
      debts: snapshot.debts,
      credit_cards: snapshot.creditCards,
      assets: snapshot.assets,
      monthly_income: snapshot.monthlyIncome,
      monthly_fixed_costs: snapshot.monthlyFixedCosts,
      monthly_variable_costs: snapshot.monthlyVariableCosts,
      total_debt: snapshot.totalDebt,
      total_assets: snapshot.totalAssets,
      net_worth: snapshot.netWorth,
      health_score: snapshot.healthScore,
      note: snapshot.note,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error adding financial snapshot:', error);
    return null;
  }

  return {
    id: data.id,
    createdAtISO: data.created_at,
    snapshotDateISO: data.snapshot_date_iso,
    name: data.name,
    incomeSources: data.income_sources || [],
    fixedCosts: data.fixed_costs || [],
    variableCosts: data.variable_costs || [],
    debts: data.debts || [],
    creditCards: data.credit_cards || [],
    assets: data.assets || { savings: 0, investments: 0, other: 0 },
    monthlyIncome: parseFloat(data.monthly_income),
    monthlyFixedCosts: parseFloat(data.monthly_fixed_costs),
    monthlyVariableCosts: parseFloat(data.monthly_variable_costs),
    totalDebt: parseFloat(data.total_debt),
    totalAssets: parseFloat(data.total_assets),
    netWorth: parseFloat(data.net_worth),
    healthScore: data.health_score,
    note: data.note,
  };
}

export async function deleteFinancialSnapshot(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('financial_snapshots')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting financial snapshot:', error);
    return false;
  }
  return true;
}

// ============================================
// YEARLY INCOME RECORDS
// ============================================

export async function getYearlyIncomeRecords(): Promise<YearlyIncomeRecord[]> {
  const { data, error } = await supabase
    .from('yearly_income_records')
    .select('*')
    .order('year', { ascending: false });

  if (error) {
    console.error('Error fetching yearly income records:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    year: row.year,
    baseSalary: parseFloat(row.base_salary || 0),
    bonusQ1: parseFloat(row.bonus_q1 || 0),
    bonusQ2: parseFloat(row.bonus_q2 || 0),
    bonusQ3: parseFloat(row.bonus_q3 || 0),
    bonusQ4: parseFloat(row.bonus_q4 || 0),
    gifts: parseFloat(row.gifts || 0),
    otherIncome: parseFloat(row.other_income || 0),
    note: row.note,
  }));
}

export async function addYearlyIncomeRecord(record: Omit<YearlyIncomeRecord, 'id'>): Promise<YearlyIncomeRecord | null> {
  const { data, error } = await supabase
    .from('yearly_income_records')
    .insert({
      year: record.year,
      base_salary: record.baseSalary,
      bonus_q1: record.bonusQ1,
      bonus_q2: record.bonusQ2,
      bonus_q3: record.bonusQ3,
      bonus_q4: record.bonusQ4,
      gifts: record.gifts,
      other_income: record.otherIncome,
      note: record.note,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error adding yearly income record:', error);
    return null;
  }

  return {
    id: data.id,
    year: data.year,
    baseSalary: parseFloat(data.base_salary || 0),
    bonusQ1: parseFloat(data.bonus_q1 || 0),
    bonusQ2: parseFloat(data.bonus_q2 || 0),
    bonusQ3: parseFloat(data.bonus_q3 || 0),
    bonusQ4: parseFloat(data.bonus_q4 || 0),
    gifts: parseFloat(data.gifts || 0),
    otherIncome: parseFloat(data.other_income || 0),
    note: data.note,
  };
}

export async function updateYearlyIncomeRecord(record: YearlyIncomeRecord): Promise<boolean> {
  const { error } = await supabase
    .from('yearly_income_records')
    .update({
      year: record.year,
      base_salary: record.baseSalary,
      bonus_q1: record.bonusQ1,
      bonus_q2: record.bonusQ2,
      bonus_q3: record.bonusQ3,
      bonus_q4: record.bonusQ4,
      gifts: record.gifts,
      other_income: record.otherIncome,
      note: record.note,
    })
    .eq('id', record.id);

  if (error) {
    console.error('Error updating yearly income record:', error);
    return false;
  }
  return true;
}

export async function deleteYearlyIncomeRecord(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('yearly_income_records')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting yearly income record:', error);
    return false;
  }
  return true;
}
