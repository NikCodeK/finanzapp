import { supabase } from './supabase';
import {
  Transaction,
  WeeklyReport,
  Budget,
  ProjectionSettings,
  IncomeSource,
  FixedCost,
  VariableCostEstimate,
  Debt,
  Assets,
  Goal,
  EnhancedWeeklyReport
} from './types';

// ============================================
// TRANSACTIONS
// ============================================

export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date_iso', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    dateISO: row.date_iso,
    amount: parseFloat(row.amount),
    type: row.type,
    category: row.category,
    account: row.account,
    recurring: row.recurring,
    note: row.note || '',
  }));
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
    .select()
    .single();

  if (error) {
    console.error('Error adding transaction:', error);
    return null;
  }

  return {
    id: data.id,
    dateISO: data.date_iso,
    amount: parseFloat(data.amount),
    type: data.type,
    category: data.category,
    account: data.account,
    recurring: data.recurring,
    note: data.note || '',
  };
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
    .select('*')
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
    .select()
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
    .select('*')
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
      note: source.note,
    })
    .select()
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
    .select('*')
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
    .select()
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
    .select('*')
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
    .select()
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
    .select('*')
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
      start_date_iso: debt.startDateISO,
      note: debt.note,
    })
    .select()
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
    .select('*')
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
    .select('*')
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
  }));
}

export async function getGoalsByYear(year: number): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
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
    })
    .select()
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
    .select('*')
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
    .select('*')
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
    .select()
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
