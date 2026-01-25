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
import { calculateHealthScore } from '@/lib/healthScore';

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
      setIncomeSources((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
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

  // Basis-Einkommen OHNE Quartalsbonus
  const monthlyIncomeWithoutBonus = useMemo(() => {
    let total = 0;
    for (const source of incomeSources) {
      if (!source.isActive || source.frequency === 'quartalsbonus') continue;
      const monthly = source.frequency === 'jaehrlich' ? source.amount / 12 : source.amount;
      total += monthly;
    }
    return total;
  }, [incomeSources]);

  // Nur der Quartalsbonus-Anteil (bestätigte Quartale)
  const monthlyBonusIncome = useMemo(() => {
    let total = 0;
    for (const source of incomeSources) {
      if (!source.isActive || source.frequency !== 'quartalsbonus') continue;
      const confirmedCount = source.confirmedQuarters
        ? Object.values(source.confirmedQuarters).filter(Boolean).length
        : 0;
      const yearlyBonus = source.amount * confirmedCount;
      total += yearlyBonus / 12;
    }
    return total;
  }, [incomeSources]);

  // Gesamt-Einkommen MIT Bonus
  const monthlyIncome = useMemo(() => {
    return monthlyIncomeWithoutBonus + monthlyBonusIncome;
  }, [monthlyIncomeWithoutBonus, monthlyBonusIncome]);

  // Quartalsbonus-Übersicht für Retrospektive
  const quarterlyBonusOverview = useMemo(() => {
    const bonusSources: IncomeSource[] = [];
    let totalBonusPerQuarter = 0;

    for (const source of incomeSources) {
      if (!source.isActive || source.frequency !== 'quartalsbonus') continue;
      bonusSources.push(source);
      totalBonusPerQuarter += source.amount;
    }

    if (bonusSources.length === 0) return null;

    const confirmedQuarters = {
      Q1: bonusSources.every((s) => s.confirmedQuarters?.Q1),
      Q2: bonusSources.every((s) => s.confirmedQuarters?.Q2),
      Q3: bonusSources.every((s) => s.confirmedQuarters?.Q3),
      Q4: bonusSources.every((s) => s.confirmedQuarters?.Q4),
    };
    const confirmedCount = Object.values(confirmedQuarters).filter(Boolean).length;
    const totalConfirmedBonus = totalBonusPerQuarter * confirmedCount;
    const totalPotentialBonus = totalBonusPerQuarter * 4;

    return {
      bonusSources,
      totalBonusPerQuarter,
      confirmedQuarters,
      confirmedCount,
      totalConfirmedBonus,
      totalPotentialBonus,
    };
  }, [incomeSources]);

  const monthlyFixedCosts = useMemo(() => {
    let total = 0;
    for (const cost of fixedCosts) {
      if (!cost.isActive) continue;
      let monthly = cost.amount;
      if (cost.frequency === 'jaehrlich') monthly = cost.amount / 12;
      if (cost.frequency === 'vierteljaehrlich') monthly = cost.amount / 3;
      total += monthly;
    }
    return total;
  }, [fixedCosts]);

  const monthlyVariableCosts = useMemo(() => {
    let total = 0;
    for (const cost of variableCosts) {
      total += cost.estimatedMonthly;
    }
    return total;
  }, [variableCosts]);

  const totalDebt = useMemo(() => {
    let total = 0;
    for (const debt of debts) {
      total += debt.currentBalance;
    }
    return total;
  }, [debts]);

  const monthlyDebtPayments = useMemo(() => {
    let total = 0;
    for (const debt of debts) {
      total += debt.monthlyPayment;
    }
    return total;
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
    const monthlyExpenses = monthlyFixedCosts + monthlyVariableCosts;
    const emergencyMonths = monthlyExpenses > 0 ? assets.savings / monthlyExpenses : 0;
    return calculateHealthScore({
      savingsRate,
      debtToIncomeRatio,
      emergencyMonths,
    });
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
    monthlyIncomeWithoutBonus,
    monthlyBonusIncome,
    quarterlyBonusOverview,
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
