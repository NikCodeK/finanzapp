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
import { mockTransactions, mockWeeklyReports, mockBudgets, defaultProjectionSettings } from './mockData';

const STORAGE_KEYS = {
  TRANSACTIONS: 'finanzapp_transactions',
  WEEKLY_REPORTS: 'finanzapp_weekly_reports',
  BUDGETS: 'finanzapp_budgets',
  PROJECTION_SETTINGS: 'finanzapp_projection_settings',
  INITIALIZED: 'finanzapp_initialized',
  // Neue Keys
  INCOME_SOURCES: 'finanzapp_income_sources',
  FIXED_COSTS: 'finanzapp_fixed_costs',
  VARIABLE_COSTS: 'finanzapp_variable_costs',
  DEBTS: 'finanzapp_debts',
  ASSETS: 'finanzapp_assets',
  GOALS: 'finanzapp_goals',
  ENHANCED_WEEKLY_REPORTS: 'finanzapp_enhanced_weekly_reports',
} as const;

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function getItem<T>(key: string, defaultValue: T): T {
  if (!isClient()) return defaultValue;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (!isClient()) return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function initializeStorage(): void {
  if (!isClient()) return;

  const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);

  if (!initialized) {
    setItem(STORAGE_KEYS.TRANSACTIONS, mockTransactions);
    setItem(STORAGE_KEYS.WEEKLY_REPORTS, mockWeeklyReports);
    setItem(STORAGE_KEYS.BUDGETS, mockBudgets);
    setItem(STORAGE_KEYS.PROJECTION_SETTINGS, defaultProjectionSettings);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
}

// Transactions
export function getTransactions(): Transaction[] {
  return getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
}

export function saveTransactions(transactions: Transaction[]): void {
  setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
}

export function addTransaction(transaction: Transaction): void {
  const transactions = getTransactions();
  transactions.push(transaction);
  saveTransactions(transactions);
}

export function updateTransaction(updated: Transaction): void {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === updated.id);
  if (index !== -1) {
    transactions[index] = updated;
    saveTransactions(transactions);
  }
}

export function deleteTransaction(id: string): void {
  const transactions = getTransactions().filter(t => t.id !== id);
  saveTransactions(transactions);
}

// Weekly Reports
export function getWeeklyReports(): WeeklyReport[] {
  return getItem<WeeklyReport[]>(STORAGE_KEYS.WEEKLY_REPORTS, []);
}

export function saveWeeklyReports(reports: WeeklyReport[]): void {
  setItem(STORAGE_KEYS.WEEKLY_REPORTS, reports);
}

export function addWeeklyReport(report: WeeklyReport): void {
  const reports = getWeeklyReports();
  reports.push(report);
  saveWeeklyReports(reports);
}

export function updateWeeklyReport(updated: WeeklyReport): void {
  const reports = getWeeklyReports();
  const index = reports.findIndex(r => r.id === updated.id);
  if (index !== -1) {
    reports[index] = updated;
    saveWeeklyReports(reports);
  }
}

export function deleteWeeklyReport(id: string): void {
  const reports = getWeeklyReports().filter(r => r.id !== id);
  saveWeeklyReports(reports);
}

// Budgets
export function getBudgets(): Budget[] {
  return getItem<Budget[]>(STORAGE_KEYS.BUDGETS, []);
}

export function saveBudgets(budgets: Budget[]): void {
  setItem(STORAGE_KEYS.BUDGETS, budgets);
}

export function updateBudget(updated: Budget): void {
  const budgets = getBudgets();
  const index = budgets.findIndex(b => b.id === updated.id);
  if (index !== -1) {
    budgets[index] = updated;
    saveBudgets(budgets);
  }
}

// Projection Settings
export function getProjectionSettings(): ProjectionSettings {
  return getItem<ProjectionSettings>(STORAGE_KEYS.PROJECTION_SETTINGS, defaultProjectionSettings);
}

export function saveProjectionSettings(settings: ProjectionSettings): void {
  setItem(STORAGE_KEYS.PROJECTION_SETTINGS, settings);
}

// Reset all data
export function resetAllData(): void {
  if (!isClient()) return;

  localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  localStorage.removeItem(STORAGE_KEYS.WEEKLY_REPORTS);
  localStorage.removeItem(STORAGE_KEYS.BUDGETS);
  localStorage.removeItem(STORAGE_KEYS.PROJECTION_SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.INCOME_SOURCES);
  localStorage.removeItem(STORAGE_KEYS.FIXED_COSTS);
  localStorage.removeItem(STORAGE_KEYS.VARIABLE_COSTS);
  localStorage.removeItem(STORAGE_KEYS.DEBTS);
  localStorage.removeItem(STORAGE_KEYS.ASSETS);
  localStorage.removeItem(STORAGE_KEYS.GOALS);
  localStorage.removeItem(STORAGE_KEYS.ENHANCED_WEEKLY_REPORTS);
  initializeStorage();
}

// ============================================
// EINNAHMEQUELLEN (Income Sources)
// ============================================

export function getIncomeSources(): IncomeSource[] {
  return getItem<IncomeSource[]>(STORAGE_KEYS.INCOME_SOURCES, []);
}

export function saveIncomeSources(sources: IncomeSource[]): void {
  setItem(STORAGE_KEYS.INCOME_SOURCES, sources);
}

export function addIncomeSource(source: IncomeSource): void {
  const sources = getIncomeSources();
  sources.push(source);
  saveIncomeSources(sources);
}

export function updateIncomeSource(updated: IncomeSource): void {
  const sources = getIncomeSources();
  const index = sources.findIndex(s => s.id === updated.id);
  if (index !== -1) {
    sources[index] = updated;
    saveIncomeSources(sources);
  }
}

export function deleteIncomeSource(id: string): void {
  const sources = getIncomeSources().filter(s => s.id !== id);
  saveIncomeSources(sources);
}

// ============================================
// FIXKOSTEN (Fixed Costs)
// ============================================

export function getFixedCosts(): FixedCost[] {
  return getItem<FixedCost[]>(STORAGE_KEYS.FIXED_COSTS, []);
}

export function saveFixedCosts(costs: FixedCost[]): void {
  setItem(STORAGE_KEYS.FIXED_COSTS, costs);
}

export function addFixedCost(cost: FixedCost): void {
  const costs = getFixedCosts();
  costs.push(cost);
  saveFixedCosts(costs);
}

export function updateFixedCost(updated: FixedCost): void {
  const costs = getFixedCosts();
  const index = costs.findIndex(c => c.id === updated.id);
  if (index !== -1) {
    costs[index] = updated;
    saveFixedCosts(costs);
  }
}

export function deleteFixedCost(id: string): void {
  const costs = getFixedCosts().filter(c => c.id !== id);
  saveFixedCosts(costs);
}

// ============================================
// VARIABLE KOSTEN (Variable Costs)
// ============================================

export function getVariableCosts(): VariableCostEstimate[] {
  return getItem<VariableCostEstimate[]>(STORAGE_KEYS.VARIABLE_COSTS, []);
}

export function saveVariableCosts(costs: VariableCostEstimate[]): void {
  setItem(STORAGE_KEYS.VARIABLE_COSTS, costs);
}

export function addVariableCost(cost: VariableCostEstimate): void {
  const costs = getVariableCosts();
  costs.push(cost);
  saveVariableCosts(costs);
}

export function updateVariableCost(updated: VariableCostEstimate): void {
  const costs = getVariableCosts();
  const index = costs.findIndex(c => c.id === updated.id);
  if (index !== -1) {
    costs[index] = updated;
    saveVariableCosts(costs);
  }
}

export function deleteVariableCost(id: string): void {
  const costs = getVariableCosts().filter(c => c.id !== id);
  saveVariableCosts(costs);
}

// ============================================
// SCHULDEN (Debts)
// ============================================

export function getDebts(): Debt[] {
  return getItem<Debt[]>(STORAGE_KEYS.DEBTS, []);
}

export function saveDebts(debts: Debt[]): void {
  setItem(STORAGE_KEYS.DEBTS, debts);
}

export function addDebt(debt: Debt): void {
  const debts = getDebts();
  debts.push(debt);
  saveDebts(debts);
}

export function updateDebt(updated: Debt): void {
  const debts = getDebts();
  const index = debts.findIndex(d => d.id === updated.id);
  if (index !== -1) {
    debts[index] = updated;
    saveDebts(debts);
  }
}

export function deleteDebt(id: string): void {
  const debts = getDebts().filter(d => d.id !== id);
  saveDebts(debts);
}

// ============================================
// VERMÖGENSWERTE (Assets)
// ============================================

const DEFAULT_ASSETS: Assets = {
  savings: 0,
  investments: 0,
  other: 0,
};

export function getAssets(): Assets {
  return getItem<Assets>(STORAGE_KEYS.ASSETS, DEFAULT_ASSETS);
}

export function saveAssets(assets: Assets): void {
  setItem(STORAGE_KEYS.ASSETS, assets);
}

// ============================================
// ZIELE (Goals)
// ============================================

export function getGoals(): Goal[] {
  return getItem<Goal[]>(STORAGE_KEYS.GOALS, []);
}

export function saveGoals(goals: Goal[]): void {
  setItem(STORAGE_KEYS.GOALS, goals);
}

export function addGoal(goal: Goal): void {
  const goals = getGoals();
  goals.push(goal);
  saveGoals(goals);
}

export function updateGoal(updated: Goal): void {
  const goals = getGoals();
  const index = goals.findIndex(g => g.id === updated.id);
  if (index !== -1) {
    goals[index] = updated;
    saveGoals(goals);
  }
}

export function deleteGoal(id: string): void {
  const goals = getGoals().filter(g => g.id !== id);
  saveGoals(goals);
}

export function getGoalsByYear(year: number): Goal[] {
  return getGoals().filter(g => g.year === year);
}

// ============================================
// ERWEITERTE WOCHENBERICHTE (Enhanced Weekly Reports)
// ============================================

export function getEnhancedWeeklyReports(): EnhancedWeeklyReport[] {
  return getItem<EnhancedWeeklyReport[]>(STORAGE_KEYS.ENHANCED_WEEKLY_REPORTS, []);
}

export function saveEnhancedWeeklyReports(reports: EnhancedWeeklyReport[]): void {
  setItem(STORAGE_KEYS.ENHANCED_WEEKLY_REPORTS, reports);
}

export function addEnhancedWeeklyReport(report: EnhancedWeeklyReport): void {
  const reports = getEnhancedWeeklyReports();
  reports.push(report);
  saveEnhancedWeeklyReports(reports);
}

export function updateEnhancedWeeklyReport(updated: EnhancedWeeklyReport): void {
  const reports = getEnhancedWeeklyReports();
  const index = reports.findIndex(r => r.id === updated.id);
  if (index !== -1) {
    reports[index] = updated;
    saveEnhancedWeeklyReports(reports);
  }
}

export function deleteEnhancedWeeklyReport(id: string): void {
  const reports = getEnhancedWeeklyReports().filter(r => r.id !== id);
  saveEnhancedWeeklyReports(reports);
}
