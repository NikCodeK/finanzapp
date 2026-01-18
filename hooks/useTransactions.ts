'use client';

import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/lib/types';
import {
  getTransactions,
  saveTransactions,
  initializeStorage,
} from '@/lib/storage';
import { generateId } from '@/lib/utils';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
    const data = getTransactions();
    setTransactions(data);
    setIsLoading(false);
  }, []);

  const addTransaction = useCallback((
    transaction: Omit<Transaction, 'id'>
  ) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
    };
    setTransactions((prev) => {
      const updated = [...prev, newTransaction];
      saveTransactions(updated);
      return updated;
    });
    return newTransaction;
  }, []);

  const updateTransaction = useCallback((updated: Transaction) => {
    setTransactions((prev) => {
      const newTransactions = prev.map((t) =>
        t.id === updated.id ? updated : t
      );
      saveTransactions(newTransactions);
      return newTransactions;
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      saveTransactions(filtered);
      return filtered;
    });
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
  };
}
