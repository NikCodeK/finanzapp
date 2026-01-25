-- Finanzapp Database Schema
-- Run this in Supabase SQL Editor

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date_iso DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  category VARCHAR(100) NOT NULL,
  account VARCHAR(100) NOT NULL,
  recurring BOOLEAN DEFAULT false,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly Reports table
CREATE TABLE IF NOT EXISTS weekly_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start_iso DATE NOT NULL,
  week_end_iso DATE NOT NULL,
  income DECIMAL(12,2) NOT NULL DEFAULT 0,
  expenses DECIMAL(12,2) NOT NULL DEFAULT 0,
  net DECIMAL(12,2) NOT NULL DEFAULT 0,
  top3 TEXT,
  insights TEXT,
  next_decision TEXT,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  biggest_win TEXT,
  biggest_challenge TEXT,
  savings_this_week DECIMAL(12,2),
  goal_contributions JSONB,
  previous_week_income DECIMAL(12,2),
  previous_week_expenses DECIMAL(12,2),
  income_change DECIMAL(12,2),
  expense_change DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month_iso VARCHAR(7) NOT NULL,
  category VARCHAR(100) NOT NULL,
  budget_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projection Settings table
CREATE TABLE IF NOT EXISTS projection_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expected_income DECIMAL(12,2) NOT NULL DEFAULT 0,
  fixed_costs DECIMAL(12,2) NOT NULL DEFAULT 0,
  variable_costs DECIMAL(12,2) NOT NULL DEFAULT 0,
  growth_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  starting_cash DECIMAL(12,2) NOT NULL DEFAULT 0,
  starting_debt DECIMAL(12,2) NOT NULL DEFAULT 0,
  scenario_multipliers JSONB DEFAULT '{"best": 1.1, "worst": 0.9}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Income Sources table
CREATE TABLE IF NOT EXISTS income_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('monatlich', 'jaehrlich', 'quartalsbonus')),
  is_active BOOLEAN DEFAULT true,
  confirmed_quarters JSONB,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fixed Costs table
CREATE TABLE IF NOT EXISTS fixed_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('monatlich', 'vierteljaehrlich', 'jaehrlich')),
  is_active BOOLEAN DEFAULT true,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Variable Costs table
CREATE TABLE IF NOT EXISTS variable_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  estimated_monthly DECIMAL(12,2) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Debts table
CREATE TABLE IF NOT EXISTS debts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('kredit', 'hypothek', 'kreditkarte', 'privatkredit', 'sonstiges')),
  original_amount DECIMAL(12,2) NOT NULL,
  current_balance DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  monthly_payment DECIMAL(12,2) NOT NULL,
  is_variable_payment BOOLEAN DEFAULT false,
  min_payment DECIMAL(12,2),
  max_payment DECIMAL(12,2),
  start_date_iso DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  savings DECIMAL(12,2) NOT NULL DEFAULT 0,
  investments DECIMAL(12,2) NOT NULL DEFAULT 0,
  other DECIMAL(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('sparen', 'schuldenabbau', 'investition', 'notgroschen', 'anschaffung', 'einkommen')),
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  start_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  deadline_iso DATE NOT NULL,
  created_at_iso DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'aktiv' CHECK (status IN ('aktiv', 'erreicht', 'pausiert')),
  priority INTEGER NOT NULL DEFAULT 2 CHECK (priority >= 1 AND priority <= 3),
  linked_debt_id UUID REFERENCES debts(id),
  milestones JSONB,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default assets row if not exists
INSERT INTO assets (savings, investments, other)
SELECT 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM assets LIMIT 1);

-- Insert default projection settings if not exists
INSERT INTO projection_settings (expected_income, fixed_costs, variable_costs, growth_rate, starting_cash, starting_debt)
SELECT 3000, 1500, 500, 2, 5000, 0
WHERE NOT EXISTS (SELECT 1 FROM projection_settings LIMIT 1);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE projection_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE variable_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since app has password protection)
CREATE POLICY "Allow all" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON weekly_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON budgets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON projection_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON income_sources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON fixed_costs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON variable_costs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON debts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON goals FOR ALL USING (true) WITH CHECK (true);

-- Indexes for common filters and ordering
CREATE INDEX IF NOT EXISTS idx_transactions_date_iso ON transactions (date_iso);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions (type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions (category);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions (account);
CREATE INDEX IF NOT EXISTS idx_transactions_date_type ON transactions (date_iso, type);

CREATE INDEX IF NOT EXISTS idx_weekly_reports_week_start_iso ON weekly_reports (week_start_iso);

CREATE INDEX IF NOT EXISTS idx_budgets_month_iso ON budgets (month_iso);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets (category);
CREATE INDEX IF NOT EXISTS idx_budgets_month_category ON budgets (month_iso, category);

CREATE INDEX IF NOT EXISTS idx_goals_year ON goals (year);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals (status);

-- ============================================
-- CREDIT CARDS
-- ============================================

-- Credit Cards Tabelle
CREATE TABLE IF NOT EXISTS credit_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  bank VARCHAR(200),
  credit_limit DECIMAL(12,2) DEFAULT 0,
  current_balance DECIMAL(12,2) DEFAULT 0,
  interest_rate DECIMAL(5,2) DEFAULT 0,
  monthly_fee DECIMAL(12,2) DEFAULT 0,
  annual_fee DECIMAL(12,2) DEFAULT 0,
  billing_day INTEGER CHECK (billing_day >= 1 AND billing_day <= 31),
  is_active BOOLEAN DEFAULT true,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit Card Balance History
CREATE TABLE IF NOT EXISTS credit_card_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  credit_card_id UUID REFERENCES credit_cards(id) ON DELETE CASCADE,
  balance DECIMAL(12,2) NOT NULL,
  recorded_at_iso DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_card_balances_card_id ON credit_card_balances (credit_card_id);
CREATE INDEX IF NOT EXISTS idx_credit_card_balances_recorded_at_iso ON credit_card_balances (recorded_at_iso);

-- ============================================
-- SUBSCRIPTIONS (Abos)
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT,
  amount DECIMAL(12,2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('monatlich', 'vierteljaehrlich', 'halbjaehrlich', 'jaehrlich')),
  category TEXT NOT NULL,
  start_date_iso TEXT NOT NULL,
  cancellation_period_days INTEGER DEFAULT 30,
  next_billing_date_iso TEXT,
  auto_renew BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON subscriptions(next_billing_date_iso);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(is_active);

-- ============================================
-- PLANNED PURCHASES (Geplante Anschaffungen)
-- ============================================

CREATE TABLE IF NOT EXISTS planned_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  monthly_contribution DECIMAL(12,2) DEFAULT 0,
  priority INTEGER DEFAULT 2 CHECK (priority IN (1, 2, 3)),
  target_date_iso TEXT,
  category TEXT,
  note TEXT,
  status TEXT DEFAULT 'aktiv' CHECK (status IN ('aktiv', 'pausiert', 'erreicht')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_planned_purchases_status ON planned_purchases(status);

-- ============================================
-- LIFE SCENARIOS (Lebens-Szenarien)
-- ============================================

CREATE TABLE IF NOT EXISTS life_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('gehaltsaenderung', 'umzug', 'jobwechsel', 'familienzuwachs', 'ruhestand', 'sonstiges')),
  income_change DECIMAL(12,2) DEFAULT 0,
  expense_changes JSONB DEFAULT '[]',
  one_time_costs DECIMAL(12,2) DEFAULT 0,
  start_date_iso TEXT,
  duration_months INTEGER,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EVENT BUDGETS (Event-Budgets)
-- ============================================

CREATE TABLE IF NOT EXISTS event_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  event_date_iso TEXT,
  category TEXT,
  note TEXT,
  status TEXT DEFAULT 'aktiv' CHECK (status IN ('aktiv', 'abgeschlossen')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_budgets_event_date ON event_budgets(event_date_iso);

-- ============================================
-- INVESTMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('aktie', 'etf', 'krypto', 'fond', 'anleihe', 'sonstiges')),
  symbol TEXT,
  isin TEXT,
  quantity DECIMAL(16,8) DEFAULT 0,
  purchase_price DECIMAL(12,4) DEFAULT 0,
  current_price DECIMAL(12,4) DEFAULT 0,
  purchase_date_iso TEXT,
  broker TEXT,
  note TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_investments_type ON investments(type);
CREATE INDEX IF NOT EXISTS idx_investments_active ON investments(is_active);

-- ============================================
-- INVESTMENT TRANSACTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS investment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('kauf', 'verkauf', 'dividende', 'split', 'gebuehr')),
  quantity DECIMAL(16,8),
  price DECIMAL(12,4),
  total_amount DECIMAL(12,2),
  fees DECIMAL(12,2) DEFAULT 0,
  date_iso TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_investment_transactions_investment_id ON investment_transactions(investment_id);
CREATE INDEX IF NOT EXISTS idx_investment_transactions_date ON investment_transactions(date_iso);

-- ============================================
-- SAVINGS PLANS (Sparpläne)
-- ============================================

CREATE TABLE IF NOT EXISTS savings_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('monatlich', 'vierteljaehrlich', 'halbjaehrlich', 'jaehrlich')),
  execution_day INTEGER DEFAULT 1 CHECK (execution_day >= 1 AND execution_day <= 28),
  start_date_iso TEXT NOT NULL,
  end_date_iso TEXT,
  is_active BOOLEAN DEFAULT true,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_savings_plans_investment_id ON savings_plans(investment_id);
CREATE INDEX IF NOT EXISTS idx_savings_plans_active ON savings_plans(is_active);

-- ============================================
-- FINANCIAL SNAPSHOTS
-- ============================================

CREATE TABLE IF NOT EXISTS financial_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date_iso TEXT NOT NULL,
  name TEXT,
  income_sources JSONB,
  fixed_costs JSONB,
  variable_costs JSONB,
  debts JSONB,
  credit_cards JSONB,
  assets JSONB,
  transactions JSONB,
  monthly_income DECIMAL(12,2),
  monthly_income_without_bonus DECIMAL(12,2),
  monthly_bonus_income DECIMAL(12,2),
  quarterly_bonus_overview JSONB,
  monthly_fixed_costs DECIMAL(12,2),
  monthly_variable_costs DECIMAL(12,2),
  total_debt DECIMAL(12,2),
  total_assets DECIMAL(12,2),
  net_worth DECIMAL(12,2),
  health_score INTEGER,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_financial_snapshots_date ON financial_snapshots(snapshot_date_iso);

-- ============================================
-- YEARLY INCOME RECORDS
-- ============================================

CREATE TABLE IF NOT EXISTS yearly_income_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  base_salary DECIMAL(12,2) DEFAULT 0,
  bonus_q1 DECIMAL(12,2) DEFAULT 0,
  bonus_q2 DECIMAL(12,2) DEFAULT 0,
  bonus_q3 DECIMAL(12,2) DEFAULT 0,
  bonus_q4 DECIMAL(12,2) DEFAULT 0,
  gifts DECIMAL(12,2) DEFAULT 0,
  other_income DECIMAL(12,2) DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_yearly_income_records_year ON yearly_income_records(year);

-- RLS für Credit Cards
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_card_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON credit_cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON credit_card_balances FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE yearly_income_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON planned_purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON life_scenarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON event_budgets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON investments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON investment_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON savings_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON financial_snapshots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON yearly_income_records FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- FINANCIAL RULES
-- ============================================

CREATE TABLE IF NOT EXISTS financial_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  income_rules TEXT,
  forecast_rules TEXT,
  briefing TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE financial_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON financial_rules FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- FINANCIAL SNAPSHOTS
-- ============================================

CREATE TABLE IF NOT EXISTS financial_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  snapshot_date_iso TEXT NOT NULL,
  name TEXT,

  -- Rohdaten als JSONB
  income_sources JSONB NOT NULL,
  fixed_costs JSONB NOT NULL,
  variable_costs JSONB NOT NULL,
  debts JSONB NOT NULL,
  credit_cards JSONB NOT NULL,
  assets JSONB NOT NULL,
  transactions JSONB DEFAULT '[]',

  -- Berechnete Werte zum Zeitpunkt
  monthly_income DECIMAL(12,2) NOT NULL,
  monthly_income_without_bonus DECIMAL(12,2) DEFAULT 0,
  monthly_bonus_income DECIMAL(12,2) DEFAULT 0,
  quarterly_bonus_overview JSONB DEFAULT NULL,
  monthly_fixed_costs DECIMAL(12,2) NOT NULL,
  monthly_variable_costs DECIMAL(12,2) NOT NULL,
  total_debt DECIMAL(12,2) NOT NULL,
  total_assets DECIMAL(12,2) NOT NULL,
  net_worth DECIMAL(12,2) NOT NULL,
  health_score INTEGER NOT NULL,

  note TEXT
);

CREATE INDEX IF NOT EXISTS idx_snapshots_date ON financial_snapshots(snapshot_date_iso DESC);

ALTER TABLE financial_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON financial_snapshots FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- YEARLY INCOME RECORDS
-- ============================================

CREATE TABLE IF NOT EXISTS yearly_income_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  year INTEGER NOT NULL UNIQUE,

  base_salary DECIMAL(12,2) DEFAULT 0,
  bonus_q1 DECIMAL(12,2) DEFAULT 0,
  bonus_q2 DECIMAL(12,2) DEFAULT 0,
  bonus_q3 DECIMAL(12,2) DEFAULT 0,
  bonus_q4 DECIMAL(12,2) DEFAULT 0,
  gifts DECIMAL(12,2) DEFAULT 0,
  other_income DECIMAL(12,2) DEFAULT 0,

  note TEXT
);

CREATE INDEX IF NOT EXISTS idx_yearly_income_year ON yearly_income_records(year DESC);

ALTER TABLE yearly_income_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON yearly_income_records FOR ALL USING (true) WITH CHECK (true);
