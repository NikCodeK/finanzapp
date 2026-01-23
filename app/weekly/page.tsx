'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWeeklyReports } from '@/hooks/useWeeklyReports';
import { useTransactions } from '@/hooks/useTransactions';
import WeeklyReportForm from '@/components/WeeklyReportForm';
import WeeklyReportCard from '@/components/WeeklyReportCard';
import Button from '@/components/ui/Button';
import { WeeklyReport } from '@/lib/types';
import { PlusIcon } from '@heroicons/react/24/outline';
import { getWeekRange, toDateISO } from '@/lib/utils';

export default function WeeklyPage() {
  const { reports, isLoading, addReport, updateReport, deleteReport } =
    useWeeklyReports();
  const weekRange = useMemo(() => getWeekRange(new Date()), []);
  const weekStartISO = useMemo(
    () => toDateISO(weekRange.start),
    [weekRange]
  );
  const weekEndISO = useMemo(
    () => toDateISO(weekRange.end),
    [weekRange]
  );
  const { transactions, isLoading: isTransactionsLoading } = useTransactions({
    mode: 'range',
    startDateISO: weekStartISO,
    endDateISO: weekEndISO,
  });

  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState<WeeklyReport | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate current week's data from transactions
  const currentWeekData = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const transaction of transactions) {
      if (transaction.type === 'income') {
        income += transaction.amount;
      } else {
        expenses += transaction.amount;
      }
    }
    return { income, expenses, net: income - expenses };
  }, [transactions]);

  const handleSave = (reportData: Omit<WeeklyReport, 'id'>) => {
    if (editingReport) {
      updateReport({ ...reportData, id: editingReport.id });
    } else {
      addReport(reportData);
    }
    setEditingReport(null);
    setShowForm(false);
  };

  const handleEdit = (report: WeeklyReport) => {
    setEditingReport(report);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Möchten Sie diesen Wochenbericht wirklich löschen?')) {
      deleteReport(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingReport(null);
  };

  if (!mounted || isLoading || isTransactionsLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wochenberichte</h1>
          <p className="text-slate-500 mt-1">
            Reflektieren Sie wöchentlich über Ihre Finanzen
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Neuer Bericht
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <WeeklyReportForm
          onSave={handleSave}
          onCancel={handleCancel}
          initialData={editingReport}
          calculatedData={!editingReport ? currentWeekData : undefined}
        />
      )}

      {/* Reports Grid */}
      {!showForm && (
        <>
          {reports.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-500 mb-4">
                Noch keine Wochenberichte vorhanden
              </p>
              <Button onClick={() => setShowForm(true)}>
                Ersten Bericht erstellen
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map((report) => (
                <WeeklyReportCard
                  key={report.id}
                  report={report}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
