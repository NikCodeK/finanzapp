import { supabase } from './supabase';
import {
  Transaction,
  TransactionFilters,
  WeeklyReport,
  Budget,
  ProjectionSettings,
  FinancialRules,
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
  Subscription,
  PlannedPurchase,
  LifeScenario,
  EventBudget,
  Investment,
  InvestmentTransaction,
  SavingsPlan,
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

export async function deleteTransactionsBulk(ids: string[]): Promise<boolean> {
  if (ids.length === 0) return true;

  const { error } = await supabase
    .from('transactions')
    .delete()
    .in('id', ids);

  if (error) {
    console.error('Error bulk deleting transactions:', error);
    return false;
  }
  return true;
}

// ============================================
// FINANCIAL RULES
// ============================================

export async function getFinancialRules(): Promise<FinancialRules | null> {
  const { data, error } = await supabase
    .from('financial_rules')
    .select('id, income_rules, forecast_rules, briefing, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching financial rules:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    incomeRules: data.income_rules || '',
    forecastRules: data.forecast_rules || '',
    briefing: data.briefing || '',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function saveFinancialRules(
  rules: Omit<FinancialRules, 'id'> & { id?: string }
): Promise<FinancialRules | null> {
  const payload = {
    income_rules: rules.incomeRules,
    forecast_rules: rules.forecastRules,
    briefing: rules.briefing,
    updated_at: new Date().toISOString(),
  };

  if (rules.id) {
    const { data, error } = await supabase
      .from('financial_rules')
      .update(payload)
      .eq('id', rules.id)
      .select('id, income_rules, forecast_rules, briefing, created_at, updated_at')
      .single();

    if (error) {
      console.error('Error updating financial rules:', error);
      return null;
    }

    return {
      id: data.id,
      incomeRules: data.income_rules || '',
      forecastRules: data.forecast_rules || '',
      briefing: data.briefing || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  const { data, error } = await supabase
    .from('financial_rules')
    .insert({
      ...payload,
      created_at: new Date().toISOString(),
    })
    .select('id, income_rules, forecast_rules, briefing, created_at, updated_at')
    .single();

  if (error) {
    console.error('Error creating financial rules:', error);
    return null;
  }

  return {
    id: data.id,
    incomeRules: data.income_rules || '',
    forecastRules: data.forecast_rules || '',
    briefing: data.briefing || '',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
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
    transactions: row.transactions || [],
    monthlyIncome: parseFloat(row.monthly_income || 0),
    monthlyIncomeWithoutBonus: parseFloat(row.monthly_income_without_bonus || 0),
    monthlyBonusIncome: parseFloat(row.monthly_bonus_income || 0),
    quarterlyBonusOverview: row.quarterly_bonus_overview || null,
    monthlyFixedCosts: parseFloat(row.monthly_fixed_costs || 0),
    monthlyVariableCosts: parseFloat(row.monthly_variable_costs || 0),
    totalDebt: parseFloat(row.total_debt || 0),
    totalAssets: parseFloat(row.total_assets || 0),
    netWorth: parseFloat(row.net_worth || 0),
    healthScore: row.health_score || 0,
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
      transactions: snapshot.transactions,
      monthly_income: snapshot.monthlyIncome,
      monthly_income_without_bonus: snapshot.monthlyIncomeWithoutBonus,
      monthly_bonus_income: snapshot.monthlyBonusIncome,
      quarterly_bonus_overview: snapshot.quarterlyBonusOverview,
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
    transactions: data.transactions || [],
    monthlyIncome: parseFloat(data.monthly_income || 0),
    monthlyIncomeWithoutBonus: parseFloat(data.monthly_income_without_bonus || 0),
    monthlyBonusIncome: parseFloat(data.monthly_bonus_income || 0),
    quarterlyBonusOverview: data.quarterly_bonus_overview || null,
    monthlyFixedCosts: parseFloat(data.monthly_fixed_costs || 0),
    monthlyVariableCosts: parseFloat(data.monthly_variable_costs || 0),
    totalDebt: parseFloat(data.total_debt || 0),
    totalAssets: parseFloat(data.total_assets || 0),
    netWorth: parseFloat(data.net_worth || 0),
    healthScore: data.health_score || 0,
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

// ============================================
// SUBSCRIPTIONS (Abos)
// ============================================

export async function getSubscriptions(): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, name, provider, amount, frequency, category, start_date_iso, cancellation_period_days, next_billing_date_iso, auto_renew, is_active, note')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    provider: row.provider,
    amount: parseFloat(row.amount),
    frequency: row.frequency,
    category: row.category,
    startDateISO: row.start_date_iso,
    cancellationPeriodDays: row.cancellation_period_days || 30,
    nextBillingDateISO: row.next_billing_date_iso,
    autoRenew: row.auto_renew ?? true,
    isActive: row.is_active ?? true,
    note: row.note,
  }));
}

export async function addSubscription(subscription: Omit<Subscription, 'id'>): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      name: subscription.name,
      provider: subscription.provider,
      amount: subscription.amount,
      frequency: subscription.frequency,
      category: subscription.category,
      start_date_iso: subscription.startDateISO,
      cancellation_period_days: subscription.cancellationPeriodDays,
      next_billing_date_iso: subscription.nextBillingDateISO,
      auto_renew: subscription.autoRenew,
      is_active: subscription.isActive,
      note: subscription.note,
    })
    .select('id, name, provider, amount, frequency, category, start_date_iso, cancellation_period_days, next_billing_date_iso, auto_renew, is_active, note')
    .single();

  if (error) {
    console.error('Error adding subscription:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    provider: data.provider,
    amount: parseFloat(data.amount),
    frequency: data.frequency,
    category: data.category,
    startDateISO: data.start_date_iso,
    cancellationPeriodDays: data.cancellation_period_days || 30,
    nextBillingDateISO: data.next_billing_date_iso,
    autoRenew: data.auto_renew ?? true,
    isActive: data.is_active ?? true,
    note: data.note,
  };
}

export async function updateSubscription(subscription: Subscription): Promise<boolean> {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      name: subscription.name,
      provider: subscription.provider,
      amount: subscription.amount,
      frequency: subscription.frequency,
      category: subscription.category,
      start_date_iso: subscription.startDateISO,
      cancellation_period_days: subscription.cancellationPeriodDays,
      next_billing_date_iso: subscription.nextBillingDateISO,
      auto_renew: subscription.autoRenew,
      is_active: subscription.isActive,
      note: subscription.note,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
    return false;
  }
  return true;
}

export async function deleteSubscription(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting subscription:', error);
    return false;
  }
  return true;
}

// ============================================
// PLANNED PURCHASES (Geplante Anschaffungen)
// ============================================

export async function getPlannedPurchases(): Promise<PlannedPurchase[]> {
  const { data, error } = await supabase
    .from('planned_purchases')
    .select('id, name, target_amount, current_amount, monthly_contribution, priority, target_date_iso, category, note, status')
    .order('priority', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching planned purchases:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    targetAmount: parseFloat(row.target_amount),
    currentAmount: parseFloat(row.current_amount || 0),
    monthlyContribution: parseFloat(row.monthly_contribution || 0),
    priority: row.priority as 1 | 2 | 3,
    targetDateISO: row.target_date_iso,
    category: row.category,
    note: row.note,
    status: row.status || 'aktiv',
  }));
}

export async function addPlannedPurchase(purchase: Omit<PlannedPurchase, 'id'>): Promise<PlannedPurchase | null> {
  const { data, error } = await supabase
    .from('planned_purchases')
    .insert({
      name: purchase.name,
      target_amount: purchase.targetAmount,
      current_amount: purchase.currentAmount,
      monthly_contribution: purchase.monthlyContribution,
      priority: purchase.priority,
      target_date_iso: purchase.targetDateISO,
      category: purchase.category,
      note: purchase.note,
      status: purchase.status,
    })
    .select('id, name, target_amount, current_amount, monthly_contribution, priority, target_date_iso, category, note, status')
    .single();

  if (error) {
    console.error('Error adding planned purchase:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    targetAmount: parseFloat(data.target_amount),
    currentAmount: parseFloat(data.current_amount || 0),
    monthlyContribution: parseFloat(data.monthly_contribution || 0),
    priority: data.priority as 1 | 2 | 3,
    targetDateISO: data.target_date_iso,
    category: data.category,
    note: data.note,
    status: data.status || 'aktiv',
  };
}

export async function updatePlannedPurchase(purchase: PlannedPurchase): Promise<boolean> {
  const { error } = await supabase
    .from('planned_purchases')
    .update({
      name: purchase.name,
      target_amount: purchase.targetAmount,
      current_amount: purchase.currentAmount,
      monthly_contribution: purchase.monthlyContribution,
      priority: purchase.priority,
      target_date_iso: purchase.targetDateISO,
      category: purchase.category,
      note: purchase.note,
      status: purchase.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', purchase.id);

  if (error) {
    console.error('Error updating planned purchase:', error);
    return false;
  }
  return true;
}

export async function deletePlannedPurchase(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('planned_purchases')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting planned purchase:', error);
    return false;
  }
  return true;
}

// ============================================
// LIFE SCENARIOS (Lebens-Szenarien)
// ============================================

export async function getLifeScenarios(): Promise<LifeScenario[]> {
  const { data, error } = await supabase
    .from('life_scenarios')
    .select('id, name, type, income_change, expense_changes, one_time_costs, start_date_iso, duration_months, note')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching life scenarios:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    type: row.type,
    incomeChange: parseFloat(row.income_change || 0),
    expenseChanges: row.expense_changes || [],
    oneTimeCosts: parseFloat(row.one_time_costs || 0),
    startDateISO: row.start_date_iso,
    durationMonths: row.duration_months,
    note: row.note,
  }));
}

export async function addLifeScenario(scenario: Omit<LifeScenario, 'id'>): Promise<LifeScenario | null> {
  const { data, error } = await supabase
    .from('life_scenarios')
    .insert({
      name: scenario.name,
      type: scenario.type,
      income_change: scenario.incomeChange,
      expense_changes: scenario.expenseChanges,
      one_time_costs: scenario.oneTimeCosts,
      start_date_iso: scenario.startDateISO,
      duration_months: scenario.durationMonths,
      note: scenario.note,
    })
    .select('id, name, type, income_change, expense_changes, one_time_costs, start_date_iso, duration_months, note')
    .single();

  if (error) {
    console.error('Error adding life scenario:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    type: data.type,
    incomeChange: parseFloat(data.income_change || 0),
    expenseChanges: data.expense_changes || [],
    oneTimeCosts: parseFloat(data.one_time_costs || 0),
    startDateISO: data.start_date_iso,
    durationMonths: data.duration_months,
    note: data.note,
  };
}

export async function updateLifeScenario(scenario: LifeScenario): Promise<boolean> {
  const { error } = await supabase
    .from('life_scenarios')
    .update({
      name: scenario.name,
      type: scenario.type,
      income_change: scenario.incomeChange,
      expense_changes: scenario.expenseChanges,
      one_time_costs: scenario.oneTimeCosts,
      start_date_iso: scenario.startDateISO,
      duration_months: scenario.durationMonths,
      note: scenario.note,
      updated_at: new Date().toISOString(),
    })
    .eq('id', scenario.id);

  if (error) {
    console.error('Error updating life scenario:', error);
    return false;
  }
  return true;
}

export async function deleteLifeScenario(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('life_scenarios')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting life scenario:', error);
    return false;
  }
  return true;
}

// ============================================
// EVENT BUDGETS (Event-Budgets)
// ============================================

export async function getEventBudgets(): Promise<EventBudget[]> {
  const { data, error } = await supabase
    .from('event_budgets')
    .select('id, name, target_amount, current_amount, event_date_iso, category, note, status')
    .order('event_date_iso', { ascending: true });

  if (error) {
    console.error('Error fetching event budgets:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    targetAmount: parseFloat(row.target_amount),
    currentAmount: parseFloat(row.current_amount || 0),
    eventDateISO: row.event_date_iso,
    category: row.category,
    note: row.note,
    status: row.status || 'aktiv',
  }));
}

export async function addEventBudget(budget: Omit<EventBudget, 'id'>): Promise<EventBudget | null> {
  const { data, error } = await supabase
    .from('event_budgets')
    .insert({
      name: budget.name,
      target_amount: budget.targetAmount,
      current_amount: budget.currentAmount,
      event_date_iso: budget.eventDateISO,
      category: budget.category,
      note: budget.note,
      status: budget.status,
    })
    .select('id, name, target_amount, current_amount, event_date_iso, category, note, status')
    .single();

  if (error) {
    console.error('Error adding event budget:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    targetAmount: parseFloat(data.target_amount),
    currentAmount: parseFloat(data.current_amount || 0),
    eventDateISO: data.event_date_iso,
    category: data.category,
    note: data.note,
    status: data.status || 'aktiv',
  };
}

export async function updateEventBudget(budget: EventBudget): Promise<boolean> {
  const { error } = await supabase
    .from('event_budgets')
    .update({
      name: budget.name,
      target_amount: budget.targetAmount,
      current_amount: budget.currentAmount,
      event_date_iso: budget.eventDateISO,
      category: budget.category,
      note: budget.note,
      status: budget.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', budget.id);

  if (error) {
    console.error('Error updating event budget:', error);
    return false;
  }
  return true;
}

export async function deleteEventBudget(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('event_budgets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting event budget:', error);
    return false;
  }
  return true;
}

// ============================================
// INVESTMENTS
// ============================================

export async function getInvestments(): Promise<Investment[]> {
  const { data, error } = await supabase
    .from('investments')
    .select('id, name, type, symbol, isin, quantity, purchase_price, current_price, purchase_date_iso, broker, note, is_active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching investments:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    type: row.type,
    symbol: row.symbol,
    isin: row.isin,
    quantity: parseFloat(row.quantity || 0),
    purchasePrice: parseFloat(row.purchase_price || 0),
    currentPrice: parseFloat(row.current_price || 0),
    purchaseDateISO: row.purchase_date_iso,
    broker: row.broker,
    note: row.note,
    isActive: row.is_active ?? true,
  }));
}

export async function addInvestment(investment: Omit<Investment, 'id'>): Promise<Investment | null> {
  const { data, error } = await supabase
    .from('investments')
    .insert({
      name: investment.name,
      type: investment.type,
      symbol: investment.symbol,
      isin: investment.isin,
      quantity: investment.quantity,
      purchase_price: investment.purchasePrice,
      current_price: investment.currentPrice,
      purchase_date_iso: investment.purchaseDateISO,
      broker: investment.broker,
      note: investment.note,
      is_active: investment.isActive,
    })
    .select('id, name, type, symbol, isin, quantity, purchase_price, current_price, purchase_date_iso, broker, note, is_active')
    .single();

  if (error) {
    console.error('Error adding investment:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    type: data.type,
    symbol: data.symbol,
    isin: data.isin,
    quantity: parseFloat(data.quantity || 0),
    purchasePrice: parseFloat(data.purchase_price || 0),
    currentPrice: parseFloat(data.current_price || 0),
    purchaseDateISO: data.purchase_date_iso,
    broker: data.broker,
    note: data.note,
    isActive: data.is_active ?? true,
  };
}

export async function updateInvestment(investment: Investment): Promise<boolean> {
  const { error } = await supabase
    .from('investments')
    .update({
      name: investment.name,
      type: investment.type,
      symbol: investment.symbol,
      isin: investment.isin,
      quantity: investment.quantity,
      purchase_price: investment.purchasePrice,
      current_price: investment.currentPrice,
      purchase_date_iso: investment.purchaseDateISO,
      broker: investment.broker,
      note: investment.note,
      is_active: investment.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', investment.id);

  if (error) {
    console.error('Error updating investment:', error);
    return false;
  }
  return true;
}

export async function deleteInvestment(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('investments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting investment:', error);
    return false;
  }
  return true;
}

// ============================================
// INVESTMENT TRANSACTIONS
// ============================================

export async function getInvestmentTransactions(investmentId?: string): Promise<InvestmentTransaction[]> {
  let query = supabase
    .from('investment_transactions')
    .select('id, investment_id, type, quantity, price, total_amount, fees, date_iso, note')
    .order('date_iso', { ascending: false });

  if (investmentId) {
    query = query.eq('investment_id', investmentId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching investment transactions:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    investmentId: row.investment_id,
    type: row.type,
    quantity: row.quantity ? parseFloat(row.quantity) : undefined,
    price: row.price ? parseFloat(row.price) : undefined,
    totalAmount: row.total_amount ? parseFloat(row.total_amount) : undefined,
    fees: parseFloat(row.fees || 0),
    dateISO: row.date_iso,
    note: row.note,
  }));
}

export async function addInvestmentTransaction(transaction: Omit<InvestmentTransaction, 'id'>): Promise<InvestmentTransaction | null> {
  const { data, error } = await supabase
    .from('investment_transactions')
    .insert({
      investment_id: transaction.investmentId,
      type: transaction.type,
      quantity: transaction.quantity,
      price: transaction.price,
      total_amount: transaction.totalAmount,
      fees: transaction.fees,
      date_iso: transaction.dateISO,
      note: transaction.note,
    })
    .select('id, investment_id, type, quantity, price, total_amount, fees, date_iso, note')
    .single();

  if (error) {
    console.error('Error adding investment transaction:', error);
    return null;
  }

  return {
    id: data.id,
    investmentId: data.investment_id,
    type: data.type,
    quantity: data.quantity ? parseFloat(data.quantity) : undefined,
    price: data.price ? parseFloat(data.price) : undefined,
    totalAmount: data.total_amount ? parseFloat(data.total_amount) : undefined,
    fees: parseFloat(data.fees || 0),
    dateISO: data.date_iso,
    note: data.note,
  };
}

export async function deleteInvestmentTransaction(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('investment_transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting investment transaction:', error);
    return false;
  }
  return true;
}

// ============================================
// SAVINGS PLANS (Sparpläne)
// ============================================

export async function getSavingsPlans(): Promise<SavingsPlan[]> {
  const { data, error } = await supabase
    .from('savings_plans')
    .select('id, investment_id, name, amount, frequency, execution_day, start_date_iso, end_date_iso, is_active, note')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching savings plans:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    investmentId: row.investment_id,
    name: row.name,
    amount: parseFloat(row.amount),
    frequency: row.frequency,
    executionDay: row.execution_day || 1,
    startDateISO: row.start_date_iso,
    endDateISO: row.end_date_iso,
    isActive: row.is_active ?? true,
    note: row.note,
  }));
}

export async function addSavingsPlan(plan: Omit<SavingsPlan, 'id'>): Promise<SavingsPlan | null> {
  const { data, error } = await supabase
    .from('savings_plans')
    .insert({
      investment_id: plan.investmentId,
      name: plan.name,
      amount: plan.amount,
      frequency: plan.frequency,
      execution_day: plan.executionDay,
      start_date_iso: plan.startDateISO,
      end_date_iso: plan.endDateISO,
      is_active: plan.isActive,
      note: plan.note,
    })
    .select('id, investment_id, name, amount, frequency, execution_day, start_date_iso, end_date_iso, is_active, note')
    .single();

  if (error) {
    console.error('Error adding savings plan:', error);
    return null;
  }

  return {
    id: data.id,
    investmentId: data.investment_id,
    name: data.name,
    amount: parseFloat(data.amount),
    frequency: data.frequency,
    executionDay: data.execution_day || 1,
    startDateISO: data.start_date_iso,
    endDateISO: data.end_date_iso,
    isActive: data.is_active ?? true,
    note: data.note,
  };
}

export async function updateSavingsPlan(plan: SavingsPlan): Promise<boolean> {
  const { error } = await supabase
    .from('savings_plans')
    .update({
      investment_id: plan.investmentId,
      name: plan.name,
      amount: plan.amount,
      frequency: plan.frequency,
      execution_day: plan.executionDay,
      start_date_iso: plan.startDateISO,
      end_date_iso: plan.endDateISO,
      is_active: plan.isActive,
      note: plan.note,
      updated_at: new Date().toISOString(),
    })
    .eq('id', plan.id);

  if (error) {
    console.error('Error updating savings plan:', error);
    return false;
  }
  return true;
}

export async function deleteSavingsPlan(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('savings_plans')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting savings plan:', error);
    return false;
  }
  return true;
}
