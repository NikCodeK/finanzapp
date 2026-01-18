'use client';

import { useState, useEffect, useCallback } from 'react';
import { Debt } from '@/lib/types';
import {
  getDebts,
  saveDebts,
  initializeStorage,
} from '@/lib/storage';
import { generateId } from '@/lib/utils';

export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
    const data = getDebts();
    setDebts(data);
    setIsLoading(false);
  }, []);

  const addDebt = useCallback((debt: Omit<Debt, 'id'>) => {
    const newDebt: Debt = {
      ...debt,
      id: generateId(),
    };
    setDebts((prev) => {
      const updated = [...prev, newDebt];
      saveDebts(updated);
      return updated;
    });
    return newDebt;
  }, []);

  const updateDebt = useCallback((updated: Debt) => {
    setDebts((prev) => {
      const newDebts = prev.map((d) =>
        d.id === updated.id ? updated : d
      );
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

  const getTotalDebt = useCallback(() => {
    return debts.reduce((sum, d) => sum + d.currentBalance, 0);
  }, [debts]);

  const getTotalMonthlyPayments = useCallback(() => {
    return debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  }, [debts]);

  return {
    debts,
    isLoading,
    addDebt,
    updateDebt,
    deleteDebt,
    getTotalDebt,
    getTotalMonthlyPayments,
  };
}
