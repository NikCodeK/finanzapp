'use client';

import { useState, useEffect, useCallback } from 'react';
import { EnhancedWeeklyReport, WeeklyReport } from '@/lib/types';
import {
  getWeeklyReports,
  saveWeeklyReports,
  initializeStorage,
} from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { subWeeks, parseISO, format } from 'date-fns';

export function useEnhancedWeeklyReport() {
  const [reports, setReports] = useState<EnhancedWeeklyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
    const data = getWeeklyReports() as EnhancedWeeklyReport[];
    // Sort by weekStartISO descending (newest first)
    const sorted = [...data].sort(
      (a, b) => b.weekStartISO.localeCompare(a.weekStartISO)
    );
    setReports(sorted);
    setIsLoading(false);
  }, []);

  const getPreviousWeekReport = useCallback((weekStartISO: string): EnhancedWeeklyReport | undefined => {
    const currentWeekStart = parseISO(weekStartISO);
    const previousWeekStart = subWeeks(currentWeekStart, 1);
    const previousWeekStartISO = format(previousWeekStart, 'yyyy-MM-dd');
    return reports.find((r) => r.weekStartISO === previousWeekStartISO);
  }, [reports]);

  const calculateComparison = useCallback((
    report: Omit<EnhancedWeeklyReport, 'id'>
  ): Partial<EnhancedWeeklyReport> => {
    const previousReport = getPreviousWeekReport(report.weekStartISO);
    if (!previousReport) {
      return {};
    }

    return {
      previousWeekIncome: previousReport.income,
      previousWeekExpenses: previousReport.expenses,
      incomeChange: report.income - previousReport.income,
      expenseChange: report.expenses - previousReport.expenses,
    };
  }, [getPreviousWeekReport]);

  const addReport = useCallback((
    report: Omit<EnhancedWeeklyReport, 'id'>
  ) => {
    const comparison = calculateComparison(report);
    const newReport: EnhancedWeeklyReport = {
      ...report,
      ...comparison,
      id: generateId(),
    };
    setReports((prev) => {
      const updated = [newReport, ...prev];
      saveWeeklyReports(updated as WeeklyReport[]);
      return updated;
    });
    return newReport;
  }, [calculateComparison]);

  const updateReport = useCallback((updated: EnhancedWeeklyReport) => {
    const comparison = calculateComparison(updated);
    const reportWithComparison = { ...updated, ...comparison };
    setReports((prev) => {
      const newReports = prev.map((r) =>
        r.id === updated.id ? reportWithComparison : r
      );
      saveWeeklyReports(newReports as WeeklyReport[]);
      return newReports;
    });
  }, [calculateComparison]);

  const deleteReport = useCallback((id: string) => {
    setReports((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      saveWeeklyReports(filtered as WeeklyReport[]);
      return filtered;
    });
  }, []);

  const getReportByWeek = useCallback(
    (weekStartISO: string) => {
      return reports.find((r) => r.weekStartISO === weekStartISO);
    },
    [reports]
  );

  const getWeekOverWeekTrend = useCallback(() => {
    if (reports.length < 2) return null;

    const [latest, previous] = reports;
    return {
      incomeChange: latest.income - previous.income,
      expenseChange: latest.expenses - previous.expenses,
      netChange: latest.net - previous.net,
      incomeChangePercent: previous.income > 0
        ? (latest.income - previous.income) / previous.income
        : 0,
      expenseChangePercent: previous.expenses > 0
        ? (latest.expenses - previous.expenses) / previous.expenses
        : 0,
    };
  }, [reports]);

  return {
    reports,
    isLoading,
    addReport,
    updateReport,
    deleteReport,
    getReportByWeek,
    getPreviousWeekReport,
    getWeekOverWeekTrend,
  };
}
