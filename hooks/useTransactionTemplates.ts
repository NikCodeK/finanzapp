'use client';

import { useState, useEffect, useCallback } from 'react';
import { TransactionTemplate, Transaction } from '@/lib/types';
import {
  getTransactionTemplates,
  addTransactionTemplate as addTemplateDB,
  updateTransactionTemplate as updateTemplateDB,
  deleteTransactionTemplate as deleteTemplateDB,
} from '@/lib/supabase-storage';
import { toDateISO } from '@/lib/utils';

export function useTransactionTemplates() {
  const [templates, setTemplates] = useState<TransactionTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTemplates = useCallback(() => {
    setIsLoading(true);
    const data = getTransactionTemplates();
    setTemplates(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const addTemplate = useCallback((template: Omit<TransactionTemplate, 'id'>) => {
    const newTemplate = addTemplateDB(template);
    if (newTemplate) {
      setTemplates((prev) => [...prev, newTemplate]);
    }
    return newTemplate;
  }, []);

  const updateTemplate = useCallback((template: TransactionTemplate) => {
    const success = updateTemplateDB(template);
    if (success) {
      setTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? template : t))
      );
    }
    return success;
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    const success = deleteTemplateDB(id);
    if (success) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    }
    return success;
  }, []);

  // Create a transaction from a template
  const createTransactionFromTemplate = useCallback(
    (templateId: string): Omit<Transaction, 'id'> | null => {
      const template = templates.find((t) => t.id === templateId);
      if (!template) return null;

      return {
        type: template.type,
        amount: template.amount,
        category: template.category,
        account: template.account,
        dateISO: toDateISO(new Date()),
        recurring: false,
        note: template.note || '',
      };
    },
    [templates]
  );

  // Get templates by type
  const getTemplatesByType = useCallback(
    (type: 'income' | 'expense') => {
      return templates.filter((t) => t.type === type);
    },
    [templates]
  );

  return {
    templates,
    isLoading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    createTransactionFromTemplate,
    getTemplatesByType,
    refresh: loadTemplates,
  };
}
