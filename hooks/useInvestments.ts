'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Investment, InvestmentTransaction, SavingsPlan } from '@/lib/types';
import {
  getInvestments,
  addInvestment as addInvestmentDB,
  updateInvestment as updateInvestmentDB,
  deleteInvestment as deleteInvestmentDB,
  getInvestmentTransactions,
  addInvestmentTransaction as addInvestmentTransactionDB,
  deleteInvestmentTransaction as deleteInvestmentTransactionDB,
  getSavingsPlans,
  addSavingsPlan as addSavingsPlanDB,
  updateSavingsPlan as updateSavingsPlanDB,
  deleteSavingsPlan as deleteSavingsPlanDB,
} from '@/lib/supabase-storage';

export function useInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<InvestmentTransaction[]>([]);
  const [savingsPlans, setSavingsPlans] = useState<SavingsPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [investmentData, transactionData, planData] = await Promise.all([
      getInvestments(),
      getInvestmentTransactions(),
      getSavingsPlans(),
    ]);
    setInvestments(investmentData);
    setTransactions(transactionData);
    setSavingsPlans(planData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Investments CRUD
  const addInvestment = useCallback(async (investment: Omit<Investment, 'id'>) => {
    const newInvestment = await addInvestmentDB(investment);
    if (newInvestment) {
      setInvestments(prev => [newInvestment, ...prev]);
    }
    return newInvestment;
  }, []);

  const updateInvestment = useCallback(async (investment: Investment) => {
    const success = await updateInvestmentDB(investment);
    if (success) {
      setInvestments(prev =>
        prev.map(i => (i.id === investment.id ? investment : i))
      );
    }
    return success;
  }, []);

  const deleteInvestment = useCallback(async (id: string) => {
    const success = await deleteInvestmentDB(id);
    if (success) {
      setInvestments(prev => prev.filter(i => i.id !== id));
    }
    return success;
  }, []);

  // Investment Transactions CRUD
  const addInvestmentTransaction = useCallback(async (transaction: Omit<InvestmentTransaction, 'id'>) => {
    const newTransaction = await addInvestmentTransactionDB(transaction);
    if (newTransaction) {
      setTransactions(prev => [newTransaction, ...prev]);

      // Update investment quantity and price based on transaction
      const investment = investments.find(i => i.id === transaction.investmentId);
      if (investment) {
        let newQuantity = investment.quantity;
        if (transaction.type === 'kauf' && transaction.quantity) {
          newQuantity += transaction.quantity;
        } else if (transaction.type === 'verkauf' && transaction.quantity) {
          newQuantity -= transaction.quantity;
        }

        const updatedInvestment = {
          ...investment,
          quantity: newQuantity,
          currentPrice: transaction.price || investment.currentPrice,
        };
        await updateInvestmentDB(updatedInvestment);
        setInvestments(prev =>
          prev.map(i => (i.id === investment.id ? updatedInvestment : i))
        );
      }
    }
    return newTransaction;
  }, [investments]);

  const deleteInvestmentTransaction = useCallback(async (id: string) => {
    const success = await deleteInvestmentTransactionDB(id);
    if (success) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
    return success;
  }, []);

  // Savings Plans CRUD
  const addSavingsPlan = useCallback(async (plan: Omit<SavingsPlan, 'id'>) => {
    const newPlan = await addSavingsPlanDB(plan);
    if (newPlan) {
      setSavingsPlans(prev => [newPlan, ...prev]);
    }
    return newPlan;
  }, []);

  const updateSavingsPlan = useCallback(async (plan: SavingsPlan) => {
    const success = await updateSavingsPlanDB(plan);
    if (success) {
      setSavingsPlans(prev =>
        prev.map(p => (p.id === plan.id ? plan : p))
      );
    }
    return success;
  }, []);

  const deleteSavingsPlan = useCallback(async (id: string) => {
    const success = await deleteSavingsPlanDB(id);
    if (success) {
      setSavingsPlans(prev => prev.filter(p => p.id !== id));
    }
    return success;
  }, []);

  const portfolioMetrics = useMemo(() => {
    let totalValue = 0;
    let totalCost = 0;
    let investmentCount = 0;
    const byType: Record<string, { value: number; count: number; gainLoss: number }> = {};

    for (const inv of investments) {
      if (!inv.isActive) continue;
      investmentCount += 1;
      const value = inv.quantity * inv.currentPrice;
      const cost = inv.quantity * inv.purchasePrice;
      totalValue += value;
      totalCost += cost;

      if (!byType[inv.type]) {
        byType[inv.type] = { value: 0, count: 0, gainLoss: 0 };
      }
      byType[inv.type].value += value;
      byType[inv.type].count += 1;
      byType[inv.type].gainLoss += value - cost;
    }

    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    return {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
      byType,
      investmentCount,
    };
  }, [investments]);

  // Investment with performance data
  const investmentsWithPerformance = useMemo(() => {
    return investments.map(inv => {
      const value = inv.quantity * inv.currentPrice;
      const cost = inv.quantity * inv.purchasePrice;
      const gainLoss = value - cost;
      const gainLossPercent = cost > 0 ? (gainLoss / cost) * 100 : 0;

      return {
        ...inv,
        value,
        cost,
        gainLoss,
        gainLossPercent,
      };
    });
  }, [investments]);

  // Monthly savings plan contributions
  const monthlySavingsPlanAmount = useMemo(() => {
    let total = 0;
    for (const plan of savingsPlans) {
      if (!plan.isActive) continue;
      let monthly = plan.amount;
      switch (plan.frequency) {
        case 'vierteljaehrlich':
          monthly = plan.amount / 3;
          break;
        case 'halbjaehrlich':
          monthly = plan.amount / 6;
          break;
        case 'jaehrlich':
          monthly = plan.amount / 12;
          break;
      }
      total += monthly;
    }
    return total;
  }, [savingsPlans]);

  // Total dividends received
  const totalDividends = useMemo(() => {
    let total = 0;
    for (const transaction of transactions) {
      if (transaction.type === 'dividende') {
        total += transaction.totalAmount || 0;
      }
    }
    return total;
  }, [transactions]);

  return {
    // Investments
    investments,
    investmentsWithPerformance,
    addInvestment,
    updateInvestment,
    deleteInvestment,

    // Transactions
    transactions,
    addInvestmentTransaction,
    deleteInvestmentTransaction,
    getTransactionsForInvestment: (investmentId: string) =>
      transactions.filter(t => t.investmentId === investmentId),

    // Savings Plans
    savingsPlans,
    addSavingsPlan,
    updateSavingsPlan,
    deleteSavingsPlan,
    monthlySavingsPlanAmount,
    activeSavingsPlans: savingsPlans.filter(p => p.isActive),

    // Metrics
    portfolioMetrics,
    totalDividends,

    // General
    isLoading,
    refresh: loadData,
  };
}
