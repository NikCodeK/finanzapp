'use client';

import { useState, useEffect, useCallback } from 'react';
import { WeeklyReport } from '@/lib/types';
import {
  getWeeklyReports,
  saveWeeklyReports,
  initializeStorage,
} from '@/lib/storage';
import { generateId } from '@/lib/utils';

export function useWeeklyReports() {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
    const data = getWeeklyReports();
    // Sort by weekStartISO descending (newest first)
    const sorted = [...data].sort(
      (a, b) => b.weekStartISO.localeCompare(a.weekStartISO)
    );
    setReports(sorted);
    setIsLoading(false);
  }, []);

  const addReport = useCallback((
    report: Omit<WeeklyReport, 'id'>
  ) => {
    const newReport: WeeklyReport = {
      ...report,
      id: generateId(),
    };
    setReports((prev) => {
      const updated = [newReport, ...prev];
      saveWeeklyReports(updated);
      return updated;
    });
    return newReport;
  }, []);

  const updateReport = useCallback((updated: WeeklyReport) => {
    setReports((prev) => {
      const newReports = prev.map((r) =>
        r.id === updated.id ? updated : r
      );
      saveWeeklyReports(newReports);
      return newReports;
    });
  }, []);

  const deleteReport = useCallback((id: string) => {
    setReports((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      saveWeeklyReports(filtered);
      return filtered;
    });
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
  };
}
