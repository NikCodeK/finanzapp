'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Transaction, TransactionFilters } from '@/lib/types';
import {
  getTransactionsPage,
  getTransactionsByDateRange,
  addTransaction as addTransactionDB,
  updateTransaction as updateTransactionDB,
  deleteTransaction as deleteTransactionDB,
} from '@/lib/supabase-storage';

type UseTransactionsOptions = {
  mode?: 'page' | 'range';
  filters?: TransactionFilters;
  pageSize?: number;
  startDateISO?: string;
  endDateISO?: string;
};

export function useTransactions(options: UseTransactionsOptions = {}) {
  const {
    mode = 'page',
    filters,
    pageSize = 50,
    startDateISO,
    endDateISO,
  } = options;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);

  const filtersKey = useMemo(
    () => JSON.stringify(filters || {}),
    [filters]
  );

  const loadPage = useCallback(async (pageIndex: number, append: boolean) => {
    const offset = pageIndex * pageSize;
    const { data, total } = await getTransactionsPage(filters, pageSize, offset);
    setTransactions((prev) => (append ? [...prev, ...data] : data));
    setTotalCount(total);
    setPage(pageIndex);
    return { data, total };
  }, [filters, filtersKey, pageSize]);

  const loadRange = useCallback(async () => {
    if (!startDateISO || !endDateISO) {
      setTransactions([]);
      setTotalCount(0);
      return;
    }
    const data = await getTransactionsByDateRange(
      startDateISO,
      endDateISO,
      filters
    );
    setTransactions(data);
    setTotalCount(data.length);
  }, [startDateISO, endDateISO, filters, filtersKey]);

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    if (mode === 'range') {
      await loadRange();
    } else {
      await loadPage(0, false);
    }
    setIsLoading(false);
  }, [mode, loadPage, loadRange]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions, filtersKey, mode, startDateISO, endDateISO, pageSize]);

  const loadMore = useCallback(async () => {
    if (mode !== 'page') return;
    setIsLoadingMore(true);
    await loadPage(page + 1, true);
    setIsLoadingMore(false);
  }, [mode, loadPage, page]);

  const matchesFilters = useCallback(
    (transaction: Transaction) => {
      if (filters?.type && transaction.type !== filters.type) return false;
      if (filters?.category && transaction.category !== filters.category) return false;
      if (filters?.account && transaction.account !== filters.account) return false;
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        const note = transaction.note.toLowerCase();
        const category = transaction.category.toLowerCase();
        if (!note.includes(search) && !category.includes(search)) {
          return false;
        }
      }
      if (startDateISO && transaction.dateISO < startDateISO) return false;
      if (endDateISO && transaction.dateISO > endDateISO) return false;
      return true;
    },
    [filters, startDateISO, endDateISO]
  );

  const addTransaction = useCallback(async (
    transaction: Omit<Transaction, 'id'>
  ) => {
    const newTransaction = await addTransactionDB(transaction);
    if (newTransaction) {
      if (matchesFilters(newTransaction)) {
        setTransactions((prev) => [newTransaction, ...prev]);
        setTotalCount((prev) => prev + 1);
      }
    }
    return newTransaction;
  }, [matchesFilters]);

  const updateTransaction = useCallback(async (updated: Transaction) => {
    const success = await updateTransactionDB(updated);
    if (success) {
      setTransactions((prev) => {
        const exists = prev.some((t) => t.id === updated.id);
        const shouldInclude = matchesFilters(updated);
        if (exists && shouldInclude) {
          return prev.map((t) => (t.id === updated.id ? updated : t));
        }
        if (exists && !shouldInclude) {
          setTotalCount((count) => Math.max(0, count - 1));
          return prev.filter((t) => t.id !== updated.id);
        }
        if (!exists && shouldInclude) {
          setTotalCount((count) => count + 1);
          return [updated, ...prev];
        }
        return prev;
      });
    }
    return success;
  }, [matchesFilters]);

  const deleteTransaction = useCallback(async (id: string) => {
    const success = await deleteTransactionDB(id);
    if (success) {
      setTransactions((prev) => {
        const exists = prev.some((t) => t.id === id);
        if (exists) {
          setTotalCount((count) => Math.max(0, count - 1));
          return prev.filter((t) => t.id !== id);
        }
        return prev;
      });
    }
    return success;
  }, []);

  const hasMore = mode === 'page' && transactions.length < totalCount;

  return {
    transactions,
    isLoading,
    isLoadingMore,
    totalCount,
    hasMore,
    loadMore,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refresh: loadTransactions,
  };
}
