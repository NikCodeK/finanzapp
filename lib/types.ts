export interface Transaction {
  id: string;
  dateISO: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  account: string;
  recurring: boolean;
  note: string;
}

export interface WeeklyReport {
  id: string;
  weekStartISO: string;
  weekEndISO: string;
  income: number;
  expenses: number;
  net: number;
  top3: string;
  insights: string;
  nextDecision: string;
  mood: 1 | 2 | 3 | 4 | 5;
}

export interface Budget {
  id: string;
  monthISO: string;
  category: string;
  budgetAmount: number;
}

export interface ProjectionSettings {
  expectedIncome: number;
  fixedCosts: number;
  variableCosts: number;
  growthRate: number;
  startingCash: number;
  startingDebt: number;
  scenarioMultipliers: {
    best: number;
    worst: number;
  };
}

export interface MonthlySummary {
  income: number;
  expenses: number;
  net: number;
  savingsRate: number;
}

export interface CategoryGroup {
  [category: string]: number;
}

export interface ProjectionMonth {
  month: string;
  income: number;
  expenses: number;
  net: number;
  cumulativeCash: number;
}

export const EXPENSE_CATEGORIES = [
  'Miete',
  'Lebensmittel',
  'Transport',
  'Unterhaltung',
  'Versicherung',
  'Gesundheit',
  'Kleidung',
  'Bildung',
  'Haushalt',
  'Sonstiges',
] as const;

export const INCOME_CATEGORIES = [
  'Gehalt',
  'Freelance',
  'Investments',
  'Geschenke',
  'Sonstiges',
] as const;

export const ACCOUNTS = [
  'Girokonto',
  'Sparkonto',
  'Kreditkarte',
  'Bargeld',
] as const;

// ============================================
// NEUE TYPEN FÜR FINANZAPP ERWEITERUNG
// ============================================

// SCHULDEN & KREDITE
export type DebtType = 'kredit' | 'hypothek' | 'kreditkarte' | 'privatkredit' | 'sonstiges';

export interface Debt {
  id: string;
  name: string;                    // z.B. "Autokredit"
  type: DebtType;
  originalAmount: number;          // Ursprünglicher Betrag
  currentBalance: number;          // Aktueller Restbetrag
  interestRate: number;            // Zinssatz (%)
  monthlyPayment: number;          // Monatliche Rate
  startDateISO: string;
  note?: string;
}

// EINNAHMEQUELLEN
export interface IncomeSource {
  id: string;
  name: string;                    // z.B. "Gehalt", "Nebenjob"
  amount: number;
  frequency: 'monatlich' | 'jaehrlich';
  isActive: boolean;
  note?: string;
}

// FIXKOSTEN
export interface FixedCost {
  id: string;
  name: string;                    // z.B. "Miete", "Netflix"
  category: string;
  amount: number;
  frequency: 'monatlich' | 'vierteljaehrlich' | 'jaehrlich';
  isActive: boolean;
  note?: string;
}

// VARIABLE KOSTEN (Schätzungen)
export interface VariableCostEstimate {
  id: string;
  category: string;
  estimatedMonthly: number;
  note?: string;
}

// VERMÖGENSWERTE
export interface Assets {
  savings: number;                 // Ersparnisse
  investments: number;             // Investments
  other: number;                   // Sonstiges
}

// ZIELE
export type GoalType = 'sparen' | 'schuldenabbau' | 'investition' | 'notgroschen' | 'anschaffung';
export type GoalStatus = 'aktiv' | 'erreicht' | 'pausiert';

export interface Goal {
  id: string;
  year: number;                    // 2026
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  startAmount: number;
  deadlineISO: string;
  createdAtISO: string;
  status: GoalStatus;
  priority: 1 | 2 | 3;
  linkedDebtId?: string;           // Für Schuldenabbau-Ziele
  note?: string;
}

// ERWEITERTER WOCHENBERICHT
export interface EnhancedWeeklyReport extends WeeklyReport {
  // Vergleich zur Vorwoche
  previousWeekIncome?: number;
  previousWeekExpenses?: number;
  incomeChange?: number;
  expenseChange?: number;

  // Zielbeiträge dieser Woche
  goalContributions?: { goalId: string; amount: number }[];

  // Zusätzliche Felder
  biggestWin?: string;
  biggestChallenge?: string;
  savingsThisWeek?: number;
}

// FINANZPROFIL (für Übersicht)
export interface FinancialProfile {
  incomeSources: IncomeSource[];
  fixedCosts: FixedCost[];
  variableCosts: VariableCostEstimate[];
  debts: Debt[];
  assets: Assets;
}

// DEBT TYPE LABELS
export const DEBT_TYPES: { value: DebtType; label: string }[] = [
  { value: 'kredit', label: 'Kredit' },
  { value: 'hypothek', label: 'Hypothek' },
  { value: 'kreditkarte', label: 'Kreditkarte' },
  { value: 'privatkredit', label: 'Privatkredit' },
  { value: 'sonstiges', label: 'Sonstiges' },
];

// GOAL TYPE LABELS
export const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: 'sparen', label: 'Sparen' },
  { value: 'schuldenabbau', label: 'Schuldenabbau' },
  { value: 'investition', label: 'Investition' },
  { value: 'notgroschen', label: 'Notgroschen' },
  { value: 'anschaffung', label: 'Anschaffung' },
];
