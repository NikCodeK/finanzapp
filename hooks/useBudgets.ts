'use client';

import { useState, useEffect, useCallback } from 'react';
import { Budget } from '@/lib/types';
import {
  getBudgets,
  addBudget as addBudgetDB,
  updateBudget as updateBudgetDB,
  deleteBudget as deleteBudgetDB,
} from '@/lib/supabase-storage';
import { getCurrentMonthISO } from '@/lib/utils';

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBudgets = useCallback(async () => {
    setIsLoading(true);
    const data = await getBudgets();
    setBudgets(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const addBudget = useCallback(async (budget: Omit<Budget, 'id'>) => {
    const newBudget = await addBudgetDB(budget);
    if (newBudget) {
      setBudgets((prev) => [...prev, newBudget]);
    }
    return newBudget;
  }, []);

  const updateBudget = useCallback(async (updated: Budget) => {
    const success = await updateBudgetDB(updated);
    if (success) {
      setBudgets((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b))
      );
    }
    return success;
  }, []);

  const deleteBudget = useCallback(async (id: string) => {
    const success = await deleteBudgetDB(id);
    if (success) {
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    }
    return success;
  }, []);

  const getBudgetsByMonth = useCallback(
    (monthISO: string) => {
      return budgets.filter((b) => b.monthISO === monthISO);
    },
    [budgets]
  );

  const getCurrentMonthBudgets = useCallback(() => {
    const currentMonth = getCurrentMonthISO();
    return budgets.filter((b) => b.monthISO === currentMonth);
  }, [budgets]);

  return {
    budgets,
    isLoading,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetsByMonth,
    getCurrentMonthBudgets,
    refresh: loadBudgets,
  };
}
