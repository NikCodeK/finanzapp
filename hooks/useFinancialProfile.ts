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
  addIncomeSource as addIncomeSourceDB,
  updateIncomeSource as updateIncomeSourceDB,
  deleteIncomeSource as deleteIncomeSourceDB,
  getFixedCosts,
  addFixedCost as addFixedCostDB,
  updateFixedCost as updateFixedCostDB,
  deleteFixedCost as deleteFixedCostDB,
  getVariableCosts,
  addVariableCost as addVariableCostDB,
  updateVariableCost as updateVariableCostDB,
  deleteVariableCost as deleteVariableCostDB,
  getDebts,
  addDebt as addDebtDB,
  updateDebt as updateDebtDB,
  deleteDebt as deleteDebtDB,
  getAssets,
  saveAssets as saveAssetsDB,
} from '@/lib/supabase-storage';

export function useFinancialProfile() {
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [variableCosts, setVariableCosts] = useState<VariableCostEstimate[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [assets, setAssets] = useState<Assets>({ savings: 0, investments: 0, other: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [incomeData, fixedData, variableData, debtData, assetData] = await Promise.all([
      getIncomeSources(),
      getFixedCosts(),
      getVariableCosts(),
      getDebts(),
      getAssets(),
    ]);
    setIncomeSources(incomeData);
    setFixedCosts(fixedData);
    setVariableCosts(variableData);
    setDebts(debtData);
    setAssets(assetData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ============================================
  // INCOME SOURCES
  // ============================================

  const addIncomeSource = useCallback(async (source: Omit<IncomeSource, 'id'>) => {
    const newSource = await addIncomeSourceDB(source);
    if (newSource) {
      setIncomeSources((prev) => [...prev, newSource]);
    }
    return newSource;
  }, []);

  const updateIncomeSource = useCallback(async (updated: IncomeSource) => {
    const success = await updateIncomeSourceDB(updated);
    if (success) {
      setIncomeSources((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
    }
    return success;
  }, []);

  const deleteIncomeSource = useCallback(async (id: string) => {
    const success = await deleteIncomeSourceDB(id);
    if (success) {
      setIncomeSources((prev) => prev.filter((s) => s.id !== id));
    }
    return success;
  }, []);

  // ============================================
  // FIXED COSTS
  // ============================================

  const addFixedCost = useCallback(async (cost: Omit<FixedCost, 'id'>) => {
    const newCost = await addFixedCostDB(cost);
    if (newCost) {
      setFixedCosts((prev) => [...prev, newCost]);
    }
    return newCost;
  }, []);

  const updateFixedCost = useCallback(async (updated: FixedCost) => {
    const success = await updateFixedCostDB(updated);
    if (success) {
      setFixedCosts((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    }
    return success;
  }, []);

  const deleteFixedCost = useCallback(async (id: string) => {
    const success = await deleteFixedCostDB(id);
    if (success) {
      setFixedCosts((prev) => prev.filter((c) => c.id !== id));
    }
    return success;
  }, []);

  // ============================================
  // VARIABLE COSTS
  // ============================================

  const addVariableCost = useCallback(async (cost: Omit<VariableCostEstimate, 'id'>) => {
    const newCost = await addVariableCostDB(cost);
    if (newCost) {
      setVariableCosts((prev) => [...prev, newCost]);
    }
    return newCost;
  }, []);

  const updateVariableCost = useCallback(async (updated: VariableCostEstimate) => {
    const success = await updateVariableCostDB(updated);
    if (success) {
      setVariableCosts((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    }
    return success;
  }, []);

  const deleteVariableCost = useCallback(async (id: string) => {
    const success = await deleteVariableCostDB(id);
    if (success) {
      setVariableCosts((prev) => prev.filter((c) => c.id !== id));
    }
    return success;
  }, []);

  // ============================================
  // DEBTS
  // ============================================

  const addDebt = useCallback(async (debt: Omit<Debt, 'id'>) => {
    const newDebt = await addDebtDB(debt);
    if (newDebt) {
      setDebts((prev) => [...prev, newDebt]);
    }
    return newDebt;
  }, []);

  const updateDebt = useCallback(async (updated: Debt) => {
    const success = await updateDebtDB(updated);
    if (success) {
      setDebts((prev) =>
        prev.map((d) => (d.id === updated.id ? updated : d))
      );
    }
    return success;
  }, []);

  const deleteDebt = useCallback(async (id: string) => {
    const success = await deleteDebtDB(id);
    if (success) {
      setDebts((prev) => prev.filter((d) => d.id !== id));
    }
    return success;
  }, []);

  // ============================================
  // ASSETS
  // ============================================

  const updateAssets = useCallback(async (updated: Assets) => {
    const success = await saveAssetsDB(updated);
    if (success) {
      setAssets(updated);
    }
    return success;
  }, []);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const monthlyIncome = useMemo(() => {
    return incomeSources
      .filter((s) => s.isActive)
      .reduce((sum, s) => {
        let monthly = 0;
        if (s.frequency === 'monatlich') {
          monthly = s.amount;
        } else if (s.frequency === 'jaehrlich') {
          monthly = s.amount / 12;
        } else if (s.frequency === 'quartalsbonus') {
          // Nur bestätigte Quartale zählen
          const confirmedCount = s.confirmedQuarters
            ? Object.values(s.confirmedQuarters).filter(Boolean).length
            : 0;
          const yearlyBonus = s.amount * confirmedCount;
          monthly = yearlyBonus / 12;
        }
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

  const healthScore = useMemo(() => {
    let score = 50;

    if (savingsRate >= 0.2) score += 25;
    else if (savingsRate >= 0.1) score += 15;
    else if (savingsRate > 0) score += 5;
    else score -= 10;

    if (debtToIncomeRatio === 0) score += 15;
    else if (debtToIncomeRatio <= 0.2) score += 10;
    else if (debtToIncomeRatio <= 0.35) score += 5;
    else score -= 10;

    const monthlyExpenses = monthlyFixedCosts + monthlyVariableCosts;
    const emergencyMonths = monthlyExpenses > 0 ? assets.savings / monthlyExpenses : 0;
    if (emergencyMonths >= 6) score += 10;
    else if (emergencyMonths >= 3) score += 5;
    else score -= 5;

    return Math.min(Math.max(score, 0), 100);
  }, [savingsRate, debtToIncomeRatio, monthlyFixedCosts, monthlyVariableCosts, assets.savings]);

  return {
    incomeSources,
    fixedCosts,
    variableCosts,
    debts,
    assets,
    isLoading,
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
    addFixedCost,
    updateFixedCost,
    deleteFixedCost,
    addVariableCost,
    updateVariableCost,
    deleteVariableCost,
    addDebt,
    updateDebt,
    deleteDebt,
    updateAssets,
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
    refresh: loadData,
  };
}
