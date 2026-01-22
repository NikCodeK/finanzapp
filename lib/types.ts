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

export interface TransactionFilters {
  type?: Transaction['type'];
  category?: string;
  account?: string;
  search?: string;
  startDateISO?: string;
  endDateISO?: string;
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
  monthlyPayment: number;          // Monatliche Rate (oder Basis bei variabel)
  isVariablePayment: boolean;      // Ist die Rate variabel?
  minPayment?: number;             // Minimale Rate (bei variabel)
  maxPayment?: number;             // Maximale Rate (bei variabel)
  startDateISO: string;
  note?: string;
}

// EINNAHMEQUELLEN
export type IncomeFrequency = 'monatlich' | 'jaehrlich' | 'quartalsbonus';

export interface QuarterlyBonusStatus {
  Q1: boolean;  // Jan-März
  Q2: boolean;  // Apr-Juni
  Q3: boolean;  // Juli-Sept
  Q4: boolean;  // Okt-Dez
}

export interface IncomeSource {
  id: string;
  name: string;                    // z.B. "Gehalt", "Nebenjob", "Quartalsbonus"
  amount: number;
  frequency: IncomeFrequency;
  isActive: boolean;
  // Für Quartalsbonus: welche Quartale wurden bestätigt/erhalten?
  confirmedQuarters?: QuarterlyBonusStatus;
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
export type GoalType = 'sparen' | 'schuldenabbau' | 'investition' | 'notgroschen' | 'anschaffung' | 'einkommen';
export type GoalStatus = 'aktiv' | 'erreicht' | 'pausiert';

// Meilensteine für Einkommensziele
export interface IncomeMilestone {
  id: string;
  targetAmount: number;            // Ziel-Einkommen für diesen Meilenstein
  name?: string;                   // Optional: Name des Meilensteins (z.B. "Erste Gehaltserhöhung")
  reachedAtISO?: string;           // Wann wurde der Meilenstein erreicht?
}

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
  milestones?: IncomeMilestone[];  // Meilensteine für Einkommensziele
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
  { value: 'einkommen', label: 'Einkommen erhöhen' },
];

// ============================================
// TRANSAKTIONSVORLAGEN
// ============================================

export interface TransactionTemplate {
  id: string;
  name: string;                    // z.B. "Miete", "Gehalt"
  type: 'income' | 'expense';
  amount: number;
  category: string;
  account: string;
  note?: string;
}

// ============================================
// KREDITKARTEN
// ============================================

export interface CreditCard {
  id: string;
  name: string;
  bank?: string;
  creditLimit: number;
  currentBalance: number;
  interestRate: number;
  monthlyFee: number;
  annualFee: number;
  billingDay?: number;
  isActive: boolean;
  note?: string;
}

export interface CreditCardBalance {
  id: string;
  creditCardId: string;
  balance: number;
  recordedAtISO: string;
  note?: string;
}

// ============================================
// FINANCIAL SNAPSHOTS
// ============================================

export interface QuarterlyBonusOverview {
  totalBonusPerQuarter: number;
  confirmedQuarters: QuarterlyBonusStatus;
  confirmedCount: number;
  totalConfirmedBonus: number;
  totalPotentialBonus: number;
}

export interface FinancialSnapshot {
  id: string;
  createdAtISO: string;
  snapshotDateISO: string;
  name?: string;

  // Rohdaten
  incomeSources: IncomeSource[];
  fixedCosts: FixedCost[];
  variableCosts: VariableCostEstimate[];
  debts: Debt[];
  creditCards: CreditCard[];
  assets: Assets;
  transactions: Transaction[];

  // Berechnete Werte
  monthlyIncome: number;
  monthlyIncomeWithoutBonus: number;
  monthlyBonusIncome: number;
  quarterlyBonusOverview: QuarterlyBonusOverview | null;
  monthlyFixedCosts: number;
  monthlyVariableCosts: number;
  totalDebt: number;
  totalAssets: number;
  netWorth: number;
  healthScore: number;

  note?: string;
}

// ============================================
// YEARLY INCOME RECORDS
// ============================================

export interface YearlyIncomeRecord {
  id: string;
  year: number;
  baseSalary: number;
  bonusQ1: number;
  bonusQ2: number;
  bonusQ3: number;
  bonusQ4: number;
  gifts: number;
  otherIncome: number;
  note?: string;
}

// ============================================
// SUBSCRIPTIONS (Abos)
// ============================================

export type SubscriptionFrequency = 'monatlich' | 'vierteljaehrlich' | 'halbjaehrlich' | 'jaehrlich';

export interface Subscription {
  id: string;
  name: string;
  provider?: string;
  amount: number;
  frequency: SubscriptionFrequency;
  category: string;
  startDateISO: string;
  cancellationPeriodDays: number;
  nextBillingDateISO?: string;
  autoRenew: boolean;
  isActive: boolean;
  note?: string;
}

export const SUBSCRIPTION_CATEGORIES = [
  'Streaming',
  'Software',
  'Musik',
  'Fitness',
  'Zeitungen',
  'Cloud-Speicher',
  'Gaming',
  'Versicherung',
  'Mitgliedschaft',
  'Sonstiges',
] as const;

// ============================================
// PLANNED PURCHASES (Geplante Anschaffungen)
// ============================================

export type PurchaseStatus = 'aktiv' | 'pausiert' | 'erreicht';

export interface PlannedPurchase {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  priority: 1 | 2 | 3;
  targetDateISO?: string;
  category?: string;
  note?: string;
  status: PurchaseStatus;
}

export const PURCHASE_CATEGORIES = [
  'Auto',
  'Immobilie',
  'Elektronik',
  'Möbel',
  'Reise',
  'Bildung',
  'Gesundheit',
  'Sonstiges',
] as const;

// ============================================
// LIFE SCENARIOS (Lebens-Szenarien)
// ============================================

export type ScenarioType = 'gehaltsaenderung' | 'umzug' | 'jobwechsel' | 'familienzuwachs' | 'ruhestand' | 'sonstiges';

export interface ExpenseChange {
  category: string;
  changeAmount: number;
  changeType: 'absolut' | 'prozent';
}

export interface LifeScenario {
  id: string;
  name: string;
  type: ScenarioType;
  incomeChange: number;
  expenseChanges: ExpenseChange[];
  oneTimeCosts: number;
  startDateISO?: string;
  durationMonths?: number;
  note?: string;
}

export const SCENARIO_TYPES: { value: ScenarioType; label: string }[] = [
  { value: 'gehaltsaenderung', label: 'Gehaltsänderung' },
  { value: 'umzug', label: 'Umzug' },
  { value: 'jobwechsel', label: 'Jobwechsel' },
  { value: 'familienzuwachs', label: 'Familienzuwachs' },
  { value: 'ruhestand', label: 'Ruhestand' },
  { value: 'sonstiges', label: 'Sonstiges' },
];

// ============================================
// EVENT BUDGETS (Event-Budgets)
// ============================================

export type EventBudgetStatus = 'aktiv' | 'abgeschlossen';

export interface EventBudget {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  eventDateISO?: string;
  category?: string;
  note?: string;
  status: EventBudgetStatus;
}

export const EVENT_CATEGORIES = [
  'Urlaub',
  'Weihnachten',
  'Geburtstag',
  'Hochzeit',
  'Umzug',
  'Renovierung',
  'Sonstiges',
] as const;

// ============================================
// INVESTMENTS (Investments)
// ============================================

export type InvestmentType = 'aktie' | 'etf' | 'krypto' | 'fond' | 'anleihe' | 'sonstiges';

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  symbol?: string;
  isin?: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDateISO?: string;
  broker?: string;
  note?: string;
  isActive: boolean;
}

export const INVESTMENT_TYPES: { value: InvestmentType; label: string }[] = [
  { value: 'aktie', label: 'Aktie' },
  { value: 'etf', label: 'ETF' },
  { value: 'krypto', label: 'Kryptowährung' },
  { value: 'fond', label: 'Fond' },
  { value: 'anleihe', label: 'Anleihe' },
  { value: 'sonstiges', label: 'Sonstiges' },
];

// ============================================
// INVESTMENT TRANSACTIONS
// ============================================

export type InvestmentTransactionType = 'kauf' | 'verkauf' | 'dividende' | 'split' | 'gebuehr';

export interface InvestmentTransaction {
  id: string;
  investmentId: string;
  type: InvestmentTransactionType;
  quantity?: number;
  price?: number;
  totalAmount?: number;
  fees: number;
  dateISO: string;
  note?: string;
}

export const INVESTMENT_TRANSACTION_TYPES: { value: InvestmentTransactionType; label: string }[] = [
  { value: 'kauf', label: 'Kauf' },
  { value: 'verkauf', label: 'Verkauf' },
  { value: 'dividende', label: 'Dividende' },
  { value: 'split', label: 'Aktiensplit' },
  { value: 'gebuehr', label: 'Gebühr' },
];

// ============================================
// SAVINGS PLANS (Sparpläne)
// ============================================

export type SavingsPlanFrequency = 'monatlich' | 'vierteljaehrlich' | 'halbjaehrlich' | 'jaehrlich';

export interface SavingsPlan {
  id: string;
  investmentId?: string;
  name: string;
  amount: number;
  frequency: SavingsPlanFrequency;
  executionDay: number;
  startDateISO: string;
  endDateISO?: string;
  isActive: boolean;
  note?: string;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface SpendingPattern {
  dayOfWeek: number;
  dayName: string;
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
}

export interface CategoryTrend {
  category: string;
  months: {
    monthISO: string;
    amount: number;
  }[];
  trend: number; // percentage change
  averageMonthly: number;
}

export interface LifestyleInflationAlert {
  category: string;
  previousAverage: number;
  currentAverage: number;
  increasePercent: number;
  message: string;
}

export interface MissedSavingsOpportunity {
  category: string;
  actualSpent: number;
  budgetAmount: number;
  potentialSavings: number;
  message: string;
}
