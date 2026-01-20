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
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('monatlich', 'jaehrlich')),
  is_active BOOLEAN DEFAULT true,
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
  type VARCHAR(50) NOT NULL CHECK (type IN ('sparen', 'schuldenabbau', 'investition', 'notgroschen', 'anschaffung')),
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  start_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  deadline_iso DATE NOT NULL,
  created_at_iso DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'aktiv' CHECK (status IN ('aktiv', 'erreicht', 'pausiert')),
  priority INTEGER NOT NULL DEFAULT 2 CHECK (priority >= 1 AND priority <= 3),
  linked_debt_id UUID REFERENCES debts(id),
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

-- RLS für Credit Cards
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_card_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON credit_cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON credit_card_balances FOR ALL USING (true) WITH CHECK (true);
