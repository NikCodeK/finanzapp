'use client';

import { useState, useEffect, useCallback } from 'react';
import { FinancialSnapshot } from '@/lib/types';
import {
  getFinancialSnapshots,
  addFinancialSnapshot as addFinancialSnapshotDB,
  deleteFinancialSnapshot as deleteFinancialSnapshotDB,
} from '@/lib/supabase-storage';

export function useFinancialSnapshots() {
  const [snapshots, setSnapshots] = useState<FinancialSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSnapshots = useCallback(async () => {
    setIsLoading(true);
    const data = await getFinancialSnapshots();
    setSnapshots(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSnapshots();
  }, [loadSnapshots]);

  const addSnapshot = useCallback(async (snapshot: Omit<FinancialSnapshot, 'id' | 'createdAtISO'>) => {
    const newSnapshot = await addFinancialSnapshotDB(snapshot);
    if (newSnapshot) {
      setSnapshots((prev) => [newSnapshot, ...prev]);
    }
    return newSnapshot;
  }, []);

  const deleteSnapshot = useCallback(async (id: string) => {
    const success = await deleteFinancialSnapshotDB(id);
    if (success) {
      setSnapshots((prev) => prev.filter((s) => s.id !== id));
    }
    return success;
  }, []);

  return {
    snapshots,
    isLoading,
    addSnapshot,
    deleteSnapshot,
    refresh: loadSnapshots,
  };
}
