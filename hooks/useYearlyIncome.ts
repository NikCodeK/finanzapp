'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { YearlyIncomeRecord } from '@/lib/types';
import {
  getYearlyIncomeRecords,
  addYearlyIncomeRecord as addYearlyIncomeRecordDB,
  updateYearlyIncomeRecord as updateYearlyIncomeRecordDB,
  deleteYearlyIncomeRecord as deleteYearlyIncomeRecordDB,
} from '@/lib/supabase-storage';

export function useYearlyIncome() {
  const [records, setRecords] = useState<YearlyIncomeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    const data = await getYearlyIncomeRecords();
    setRecords(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const addRecord = useCallback(async (record: Omit<YearlyIncomeRecord, 'id'>) => {
    const newRecord = await addYearlyIncomeRecordDB(record);
    if (newRecord) {
      setRecords((prev) => [newRecord, ...prev].sort((a, b) => b.year - a.year));
    }
    return newRecord;
  }, []);

  const updateRecord = useCallback(async (updated: YearlyIncomeRecord) => {
    const success = await updateYearlyIncomeRecordDB(updated);
    if (success) {
      setRecords((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
    }
    return success;
  }, []);

  const deleteRecord = useCallback(async (id: string) => {
    const success = await deleteYearlyIncomeRecordDB(id);
    if (success) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
    return success;
  }, []);

  const getRecordByYear = useCallback((year: number) => {
    return records.find((r) => r.year === year);
  }, [records]);

  const getTotalForYear = useCallback((year: number) => {
    const record = records.find((r) => r.year === year);
    if (!record) return 0;
    return (
      record.baseSalary +
      record.bonusQ1 +
      record.bonusQ2 +
      record.bonusQ3 +
      record.bonusQ4 +
      record.gifts +
      record.otherIncome
    );
  }, [records]);

  const totalBonusForYear = useCallback((year: number) => {
    const record = records.find((r) => r.year === year);
    if (!record) return 0;
    return record.bonusQ1 + record.bonusQ2 + record.bonusQ3 + record.bonusQ4;
  }, [records]);

  return {
    records,
    isLoading,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecordByYear,
    getTotalForYear,
    totalBonusForYear,
    refresh: loadRecords,
  };
}
