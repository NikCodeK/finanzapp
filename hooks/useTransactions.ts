'use client';

import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/lib/types';
import {
  getTransactions,
  addTransaction as addTransactionDB,
  updateTransaction as updateTransactionDB,
  deleteTransaction as deleteTransactionDB,
} from '@/lib/supabase-storage';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    const data = await getTransactions();
    setTransactions(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const addTransaction = useCallback(async (
    transaction: Omit<Transaction, 'id'>
  ) => {
    const newTransaction = await addTransactionDB(transaction);
    if (newTransaction) {
      setTransactions((prev) => [...prev, newTransaction]);
    }
    return newTransaction;
  }, []);

  const updateTransaction = useCallback(async (updated: Transaction) => {
    const success = await updateTransactionDB(updated);
    if (success) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    }
    return success;
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    const success = await deleteTransactionDB(id);
    if (success) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
    return success;
  }, []);

  const getTransactionsByMonth = useCallback(
    (monthISO: string) => {
      return transactions.filter((t) => t.dateISO.startsWith(monthISO));
    },
    [transactions]
  );

  const getTransactionsByDateRange = useCallback(
    (startISO: string, endISO: string) => {
      return transactions.filter(
        (t) => t.dateISO >= startISO && t.dateISO <= endISO
      );
    },
    [transactions]
  );

  return {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByMonth,
    getTransactionsByDateRange,
    refresh: loadTransactions,
  };
}
