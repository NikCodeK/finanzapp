'use client';

import { useCallback, useEffect, useState } from 'react';
import { FinancialRules } from '@/lib/types';
import { getFinancialRules, saveFinancialRules } from '@/lib/supabase-storage';

export function useFinancialRules() {
  const [rules, setRules] = useState<FinancialRules | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadRules = useCallback(async () => {
    setIsLoading(true);
    const data = await getFinancialRules();
    setRules(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const saveRules = useCallback(async (next: Omit<FinancialRules, 'id'> & { id?: string }) => {
    setIsSaving(true);
    const saved = await saveFinancialRules(next);
    if (saved) {
      setRules(saved);
    }
    setIsSaving(false);
    return saved;
  }, []);

  return {
    rules,
    isLoading,
    isSaving,
    saveRules,
    refresh: loadRules,
  };
}
