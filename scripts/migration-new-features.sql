-- ============================================
-- FINANZAPP ERWEITERUNG - MIGRATION
-- ============================================
-- Neue Features: Subscriptions, Investments, Planning, Analytics

-- ============================================
-- 1. SUBSCRIPTIONS (Abos)
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider TEXT,
  amount DECIMAL(12, 2) NOT NULL,
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

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions" ON subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 2. PLANNED PURCHASES (Geplante Anschaffungen)
-- ============================================

CREATE TABLE IF NOT EXISTS planned_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) DEFAULT 0,
  monthly_contribution DECIMAL(12, 2) DEFAULT 0,
  priority INTEGER DEFAULT 2 CHECK (priority IN (1, 2, 3)),
  target_date_iso TEXT,
  category TEXT,
  note TEXT,
  status TEXT DEFAULT 'aktiv' CHECK (status IN ('aktiv', 'pausiert', 'erreicht')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE planned_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own planned purchases" ON planned_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own planned purchases" ON planned_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own planned purchases" ON planned_purchases
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own planned purchases" ON planned_purchases
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 3. LIFE SCENARIOS (Lebens-Szenarien)
-- ============================================

CREATE TABLE IF NOT EXISTS life_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('gehaltsaenderung', 'umzug', 'jobwechsel', 'familienzuwachs', 'ruhestand', 'sonstiges')),
  income_change DECIMAL(12, 2) DEFAULT 0,
  expense_changes JSONB DEFAULT '{}',
  one_time_costs DECIMAL(12, 2) DEFAULT 0,
  start_date_iso TEXT,
  duration_months INTEGER,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE life_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own life scenarios" ON life_scenarios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own life scenarios" ON life_scenarios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own life scenarios" ON life_scenarios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own life scenarios" ON life_scenarios
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. EVENT BUDGETS (Event-Budgets)
-- ============================================

CREATE TABLE IF NOT EXISTS event_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) DEFAULT 0,
  event_date_iso TEXT,
  category TEXT,
  note TEXT,
  status TEXT DEFAULT 'aktiv' CHECK (status IN ('aktiv', 'abgeschlossen')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE event_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own event budgets" ON event_budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own event budgets" ON event_budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own event budgets" ON event_budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own event budgets" ON event_budgets
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 5. INVESTMENTS (Investments)
-- ============================================

CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('aktie', 'etf', 'krypto', 'fond', 'anleihe', 'sonstiges')),
  symbol TEXT,
  isin TEXT,
  quantity DECIMAL(16, 8) DEFAULT 0,
  purchase_price DECIMAL(12, 4) DEFAULT 0,
  current_price DECIMAL(12, 4) DEFAULT 0,
  purchase_date_iso TEXT,
  broker TEXT,
  note TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own investments" ON investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investments" ON investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments" ON investments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own investments" ON investments
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 6. INVESTMENT TRANSACTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS investment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('kauf', 'verkauf', 'dividende', 'split', 'gebuehr')),
  quantity DECIMAL(16, 8),
  price DECIMAL(12, 4),
  total_amount DECIMAL(12, 2),
  fees DECIMAL(12, 2) DEFAULT 0,
  date_iso TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE investment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own investment transactions" ON investment_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investment transactions" ON investment_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investment transactions" ON investment_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own investment transactions" ON investment_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 7. SAVINGS PLANS (Sparpläne)
-- ============================================

CREATE TABLE IF NOT EXISTS savings_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('monatlich', 'vierteljaehrlich', 'halbjaehrlich', 'jaehrlich')),
  execution_day INTEGER DEFAULT 1 CHECK (execution_day >= 1 AND execution_day <= 28),
  start_date_iso TEXT NOT NULL,
  end_date_iso TEXT,
  is_active BOOLEAN DEFAULT true,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE savings_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own savings plans" ON savings_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings plans" ON savings_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings plans" ON savings_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings plans" ON savings_plans
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES for better performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON subscriptions(next_billing_date_iso);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(is_active);

CREATE INDEX IF NOT EXISTS idx_planned_purchases_user_id ON planned_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_planned_purchases_status ON planned_purchases(status);

CREATE INDEX IF NOT EXISTS idx_life_scenarios_user_id ON life_scenarios(user_id);

CREATE INDEX IF NOT EXISTS idx_event_budgets_user_id ON event_budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_event_budgets_event_date ON event_budgets(event_date_iso);

CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_type ON investments(type);
CREATE INDEX IF NOT EXISTS idx_investments_active ON investments(is_active);

CREATE INDEX IF NOT EXISTS idx_investment_transactions_user_id ON investment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_transactions_investment_id ON investment_transactions(investment_id);
CREATE INDEX IF NOT EXISTS idx_investment_transactions_date ON investment_transactions(date_iso);

CREATE INDEX IF NOT EXISTS idx_savings_plans_user_id ON savings_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_plans_investment_id ON savings_plans(investment_id);
CREATE INDEX IF NOT EXISTS idx_savings_plans_active ON savings_plans(is_active);

-- ============================================
-- Done!
-- ============================================
