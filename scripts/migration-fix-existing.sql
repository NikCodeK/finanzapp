\set ON_ERROR_STOP on

-- Align existing tables with current app expectations.

ALTER TABLE income_sources
  ADD COLUMN IF NOT EXISTS confirmed_quarters JSONB;

ALTER TABLE income_sources
  DROP CONSTRAINT IF EXISTS income_sources_frequency_check;

ALTER TABLE income_sources
  ADD CONSTRAINT income_sources_frequency_check
  CHECK (frequency IN ('monatlich', 'jaehrlich', 'quartalsbonus'));

ALTER TABLE debts
  ADD COLUMN IF NOT EXISTS is_variable_payment BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS min_payment DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS max_payment DECIMAL(12,2);

ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS milestones JSONB;

ALTER TABLE goals
  DROP CONSTRAINT IF EXISTS goals_type_check;

ALTER TABLE goals
  ADD CONSTRAINT goals_type_check
  CHECK (type IN ('sparen', 'schuldenabbau', 'investition', 'notgroschen', 'anschaffung', 'einkommen'));
