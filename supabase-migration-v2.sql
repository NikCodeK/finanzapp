-- Migration v2: Variable Debt Payments & Quarterly Bonus
-- Run this in Supabase SQL Editor

-- Update debts table for variable payments
ALTER TABLE debts
ADD COLUMN IF NOT EXISTS is_variable_payment BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS min_payment DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS max_payment DECIMAL(12,2);

-- Update income_sources table for quarterly bonus
-- First drop the old constraint
ALTER TABLE income_sources
DROP CONSTRAINT IF EXISTS income_sources_frequency_check;

-- Add new constraint with quartalsbonus option
ALTER TABLE income_sources
ADD CONSTRAINT income_sources_frequency_check
CHECK (frequency IN ('monatlich', 'jaehrlich', 'quartalsbonus'));

-- Add confirmed_quarters for quarterly bonus tracking
ALTER TABLE income_sources
ADD COLUMN IF NOT EXISTS confirmed_quarters JSONB DEFAULT '{"Q1": false, "Q2": false, "Q3": false, "Q4": false}';
