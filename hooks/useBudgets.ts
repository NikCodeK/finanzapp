'use client';

import { useState, useEffect, useCallback } from 'react';
import { Budget } from '@/lib/types';
import { getBudgets, saveBudgets, initializeStorage } from '@/lib/storage';
import { generateId, getCurrentMonthISO } from '@/lib/utils';

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
    const data = getBudgets();
    setBudgets(data);
    setIsLoading(false);
  }, []);

  const addBudget = useCallback((budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: generateId(),
    };
    setBudgets((prev) => {
      const updated = [...prev, newBudget];
      saveBudgets(updated);
      return updated;
    });
    return newBudget;
  }, []);

  const updateBudget = useCallback((updated: Budget) => {
    setBudgets((prev) => {
      const newBudgets = prev.map((b) =>
        b.id === updated.id ? updated : b
      );
      saveBudgets(newBudgets);
      return newBudgets;
    });
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets((prev) => {
      const filtered = prev.filter((b) => b.id !== id);
      saveBudgets(filtered);
      return filtered;
    });
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
  };
}
