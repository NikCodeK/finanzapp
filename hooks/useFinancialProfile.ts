'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  IncomeSource,
  FixedCost,
  VariableCostEstimate,
  Debt,
  Assets,
} from '@/lib/types';
import {
  getIncomeSources,
  saveIncomeSources,
  getFixedCosts,
  saveFixedCosts,
  getVariableCosts,
  saveVariableCosts,
  getDebts,
  saveDebts,
  getAssets,
  saveAssets,
  initializeStorage,
} from '@/lib/storage';
import { generateId } from '@/lib/utils';

export function useFinancialProfile() {
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [variableCosts, setVariableCosts] = useState<VariableCostEstimate[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [assets, setAssets] = useState<Assets>({ savings: 0, investments: 0, other: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
    setIncomeSources(getIncomeSources());
    setFixedCosts(getFixedCosts());
    setVariableCosts(getVariableCosts());
    setDebts(getDebts());
    setAssets(getAssets());
    setIsLoading(false);
  }, []);

  // ============================================
  // INCOME SOURCES
  // ============================================

  const addIncomeSource = useCallback((source: Omit<IncomeSource, 'id'>) => {
    const newSource: IncomeSource = { ...source, id: generateId() };
    setIncomeSources((prev) => {
      const updated = [...prev, newSource];
      saveIncomeSources(updated);
      return updated;
    });
    return newSource;
  }, []);

  const updateIncomeSource = useCallback((updated: IncomeSource) => {
    setIncomeSources((prev) => {
      const newSources = prev.map((s) => (s.id === updated.id ? updated : s));
      saveIncomeSources(newSources);
      return newSources;
    });
  }, []);

  const deleteIncomeSource = useCallback((id: string) => {
    setIncomeSources((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      saveIncomeSources(filtered);
      return filtered;
    });
  }, []);

  // ============================================
  // FIXED COSTS
  // ============================================

  const addFixedCost = useCallback((cost: Omit<FixedCost, 'id'>) => {
    const newCost: FixedCost = { ...cost, id: generateId() };
    setFixedCosts((prev) => {
      const updated = [...prev, newCost];
      saveFixedCosts(updated);
      return updated;
    });
    return newCost;
  }, []);

  const updateFixedCost = useCallback((updated: FixedCost) => {
    setFixedCosts((prev) => {
      const newCosts = prev.map((c) => (c.id === updated.id ? updated : c));
      saveFixedCosts(newCosts);
      return newCosts;
    });
  }, []);

  const deleteFixedCost = useCallback((id: string) => {
    setFixedCosts((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      saveFixedCosts(filtered);
      return filtered;
    });
  }, []);

  // ============================================
  // VARIABLE COSTS
  // ============================================

  const addVariableCost = useCallback((cost: Omit<VariableCostEstimate, 'id'>) => {
    const newCost: VariableCostEstimate = { ...cost, id: generateId() };
    setVariableCosts((prev) => {
      const updated = [...prev, newCost];
      saveVariableCosts(updated);
      return updated;
    });
    return newCost;
  }, []);

  const updateVariableCost = useCallback((updated: VariableCostEstimate) => {
    setVariableCosts((prev) => {
      const newCosts = prev.map((c) => (c.id === updated.id ? updated : c));
      saveVariableCosts(newCosts);
      return newCosts;
    });
  }, []);

  const deleteVariableCost = useCallback((id: string) => {
    setVariableCosts((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      saveVariableCosts(filtered);
      return filtered;
    });
  }, []);

  // ============================================
  // DEBTS
  // ============================================

  const addDebt = useCallback((debt: Omit<Debt, 'id'>) => {
    const newDebt: Debt = { ...debt, id: generateId() };
    setDebts((prev) => {
      const updated = [...prev, newDebt];
      saveDebts(updated);
      return updated;
    });
    return newDebt;
  }, []);

  const updateDebt = useCallback((updated: Debt) => {
    setDebts((prev) => {
      const newDebts = prev.map((d) => (d.id === updated.id ? updated : d));
      saveDebts(newDebts);
      return newDebts;
    });
  }, []);

  const deleteDebt = useCallback((id: string) => {
    setDebts((prev) => {
      const filtered = prev.filter((d) => d.id !== id);
      saveDebts(filtered);
      return filtered;
    });
  }, []);

  // ============================================
  // ASSETS
  // ============================================

  const updateAssets = useCallback((updated: Assets) => {
    setAssets(updated);
    saveAssets(updated);
  }, []);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const monthlyIncome = useMemo(() => {
    return incomeSources
      .filter((s) => s.isActive)
      .reduce((sum, s) => {
        const monthly = s.frequency === 'jaehrlich' ? s.amount / 12 : s.amount;
        return sum + monthly;
      }, 0);
  }, [incomeSources]);

  const monthlyFixedCosts = useMemo(() => {
    return fixedCosts
      .filter((c) => c.isActive)
      .reduce((sum, c) => {
        let monthly = c.amount;
        if (c.frequency === 'jaehrlich') monthly = c.amount / 12;
        if (c.frequency === 'vierteljaehrlich') monthly = c.amount / 3;
        return sum + monthly;
      }, 0);
  }, [fixedCosts]);

  const monthlyVariableCosts = useMemo(() => {
    return variableCosts.reduce((sum, c) => sum + c.estimatedMonthly, 0);
  }, [variableCosts]);

  const totalDebt = useMemo(() => {
    return debts.reduce((sum, d) => sum + d.currentBalance, 0);
  }, [debts]);

  const monthlyDebtPayments = useMemo(() => {
    return debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  }, [debts]);

  const totalAssets = useMemo(() => {
    return assets.savings + assets.investments + assets.other;
  }, [assets]);

  const netWorth = useMemo(() => {
    return totalAssets - totalDebt;
  }, [totalAssets, totalDebt]);

  const availableIncome = useMemo(() => {
    return monthlyIncome - monthlyFixedCosts - monthlyVariableCosts - monthlyDebtPayments;
  }, [monthlyIncome, monthlyFixedCosts, monthlyVariableCosts, monthlyDebtPayments]);

  const debtToIncomeRatio = useMemo(() => {
    if (monthlyIncome === 0) return 0;
    return monthlyDebtPayments / monthlyIncome;
  }, [monthlyDebtPayments, monthlyIncome]);

  const savingsRate = useMemo(() => {
    if (monthlyIncome === 0) return 0;
    return availableIncome / monthlyIncome;
  }, [availableIncome, monthlyIncome]);

  // Financial Health Score (0-100)
  const healthScore = useMemo(() => {
    let score = 50;

    // Savings rate contribution (up to +25)
    if (savingsRate >= 0.2) score += 25;
    else if (savingsRate >= 0.1) score += 15;
    else if (savingsRate > 0) score += 5;
    else score -= 10;

    // Debt-to-income ratio (up to +15)
    if (debtToIncomeRatio === 0) score += 15;
    else if (debtToIncomeRatio <= 0.2) score += 10;
    else if (debtToIncomeRatio <= 0.35) score += 5;
    else score -= 10;

    // Emergency fund (3+ months = +10)
    const monthlyExpenses = monthlyFixedCosts + monthlyVariableCosts;
    const emergencyMonths = monthlyExpenses > 0 ? assets.savings / monthlyExpenses : 0;
    if (emergencyMonths >= 6) score += 10;
    else if (emergencyMonths >= 3) score += 5;
    else score -= 5;

    return Math.min(Math.max(score, 0), 100);
  }, [savingsRate, debtToIncomeRatio, monthlyFixedCosts, monthlyVariableCosts, assets.savings]);

  return {
    // Data
    incomeSources,
    fixedCosts,
    variableCosts,
    debts,
    assets,
    isLoading,

    // Income Source Actions
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,

    // Fixed Cost Actions
    addFixedCost,
    updateFixedCost,
    deleteFixedCost,

    // Variable Cost Actions
    addVariableCost,
    updateVariableCost,
    deleteVariableCost,

    // Debt Actions
    addDebt,
    updateDebt,
    deleteDebt,

    // Assets Actions
    updateAssets,

    // Computed Values
    monthlyIncome,
    monthlyFixedCosts,
    monthlyVariableCosts,
    totalDebt,
    monthlyDebtPayments,
    totalAssets,
    netWorth,
    availableIncome,
    debtToIncomeRatio,
    savingsRate,
    healthScore,
  };
}
