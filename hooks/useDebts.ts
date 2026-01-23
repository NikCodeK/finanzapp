'use client';

import { useState, useEffect, useCallback } from 'react';
import { Debt } from '@/lib/types';
import {
  getDebts,
  addDebt as addDebtDB,
  updateDebt as updateDebtDB,
  deleteDebt as deleteDebtDB,
} from '@/lib/supabase-storage';

export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDebts = useCallback(async () => {
    setIsLoading(true);
    const data = await getDebts();
    setDebts(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadDebts();
  }, [loadDebts]);

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

  const getTotalDebt = useCallback(() => {
    let total = 0;
    for (const debt of debts) {
      total += debt.currentBalance;
    }
    return total;
  }, [debts]);

  const getTotalMonthlyPayments = useCallback(() => {
    let total = 0;
    for (const debt of debts) {
      total += debt.monthlyPayment;
    }
    return total;
  }, [debts]);

  return {
    debts,
    isLoading,
    addDebt,
    updateDebt,
    deleteDebt,
    getTotalDebt,
    getTotalMonthlyPayments,
    refresh: loadDebts,
  };
}
