'use client';

import { useState, useEffect, useCallback } from 'react';
import { EnhancedWeeklyReport } from '@/lib/types';
import {
  getWeeklyReports,
  addWeeklyReport as addWeeklyReportDB,
  updateWeeklyReport as updateWeeklyReportDB,
  deleteWeeklyReport as deleteWeeklyReportDB,
} from '@/lib/supabase-storage';

export function useWeeklyReports() {
  const [reports, setReports] = useState<EnhancedWeeklyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    const data = await getWeeklyReports();
    setReports(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const addReport = useCallback(async (report: Omit<EnhancedWeeklyReport, 'id'>) => {
    const newReport = await addWeeklyReportDB(report);
    if (newReport) {
      setReports((prev) => [newReport, ...prev]);
    }
    return newReport;
  }, []);

  const updateReport = useCallback(async (updated: EnhancedWeeklyReport) => {
    const success = await updateWeeklyReportDB(updated);
    if (success) {
      setReports((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
    }
    return success;
  }, []);

  const deleteReport = useCallback(async (id: string) => {
    const success = await deleteWeeklyReportDB(id);
    if (success) {
      setReports((prev) => prev.filter((r) => r.id !== id));
    }
    return success;
  }, []);

  const getReportByWeek = useCallback(
    (weekStartISO: string) => {
      return reports.find((r) => r.weekStartISO === weekStartISO);
    },
    [reports]
  );

  return {
    reports,
    isLoading,
    addReport,
    updateReport,
    deleteReport,
    getReportByWeek,
    refresh: loadReports,
  };
}
