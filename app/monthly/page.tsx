'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import CategoryPie from '@/components/charts/CategoryPie';
import BudgetForm from '@/components/finanzen/BudgetForm';
import { Budget } from '@/lib/types';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import {
  formatCurrency,
  formatMonth,
  getCurrentMonthISO,
  getPreviousMonthsISO,
  classNames,
} from '@/lib/utils';
import {
  groupByCategory,
  getTopCategories,
} from '@/lib/calculations';
import { addMonths, subMonths, format, parseISO, startOfMonth, endOfMonth } from 'date-fns';

export default function MonthlyPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthISO());
  const monthDate = useMemo(
    () => parseISO(selectedMonth + '-01'),
    [selectedMonth]
  );
  const monthStartISO = useMemo(
    () => format(startOfMonth(monthDate), 'yyyy-MM-dd'),
    [monthDate]
  );
  const monthEndISO = useMemo(
    () => format(endOfMonth(monthDate), 'yyyy-MM-dd'),
    [monthDate]
  );

  const { transactions, isLoading } = useTransactions({
    mode: 'range',
    startDateISO: monthStartISO,
    endDateISO: monthEndISO,
  });
  const { getBudgetsByMonth, addBudget, updateBudget, deleteBudget } = useBudgets();

  const [mounted, setMounted] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const monthOptions = useMemo(() => {
    return getPreviousMonthsISO(12).map((monthISO) => ({
      value: monthISO,
      label: formatMonth(monthISO + '-01'),
    }));
  }, []);

  const monthTransactions = useMemo(() => transactions, [transactions]);

  const monthlySummary = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const transaction of monthTransactions) {
      if (transaction.type === 'income') {
        income += transaction.amount;
      } else {
        expenses += transaction.amount;
      }
    }
    const net = income - expenses;
    return {
      income,
      expenses,
      net,
      savingsRate: income > 0 ? net / income : 0,
    };
  }, [monthTransactions]);

  const expenseCategories = useMemo(
    () => getTopCategories(monthTransactions, 'expense', 10),
    [monthTransactions]
  );

  const incomeCategories = useMemo(
    () => getTopCategories(monthTransactions, 'income', 5),
    [monthTransactions]
  );

  const budgets = useMemo(
    () => getBudgetsByMonth(selectedMonth),
    [getBudgetsByMonth, selectedMonth]
  );

  const expenseByCategory = useMemo(
    () => groupByCategory(monthTransactions, 'expense'),
    [monthTransactions]
  );

  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentDate = parseISO(selectedMonth + '-01');
    const newDate =
      direction === 'prev'
        ? subMonths(currentDate, 1)
        : addMonths(currentDate, 1);
    setSelectedMonth(format(newDate, 'yyyy-MM'));
  };

  const handleSaveBudget = async (budgetData: Omit<Budget, 'id'>) => {
    if (editingBudget) {
      await updateBudget({ ...budgetData, id: editingBudget.id });
    } else {
      await addBudget({ ...budgetData, monthISO: selectedMonth });
    }
    setShowBudgetModal(false);
    setEditingBudget(null);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setShowBudgetModal(true);
  };

  const handleDeleteBudget = async (id: string) => {
    if (confirm('Möchten Sie dieses Budget wirklich löschen?')) {
      await deleteBudget(id);
    }
  };

  const existingBudgetCategories = budgets.map((b) => b.category);

  if (!mounted || isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <h1 className="text-2xl font-bold text-slate-900">Monatsübersicht</h1>
          <p className="text-slate-500 mt-1">
            Detaillierte Analyse Ihrer monatlichen Finanzen
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            options={monthOptions}
            className="w-48"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
            disabled={selectedMonth === getCurrentMonthISO()}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-sm text-green-600 font-medium">Einnahmen</p>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(monthlySummary.income)}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-sm text-red-600 font-medium">Ausgaben</p>
          <p className="text-2xl font-bold text-red-700">
            {formatCurrency(monthlySummary.expenses)}
          </p>
        </div>
        <div
          className={classNames(
            'rounded-xl p-4',
            monthlySummary.net >= 0 ? 'bg-indigo-50' : 'bg-orange-50'
          )}
        >
          <p
            className={classNames(
              'text-sm font-medium',
              monthlySummary.net >= 0 ? 'text-indigo-600' : 'text-orange-600'
            )}
          >
            Netto
          </p>
          <p
            className={classNames(
              'text-2xl font-bold',
              monthlySummary.net >= 0 ? 'text-indigo-700' : 'text-orange-700'
            )}
          >
            {formatCurrency(monthlySummary.net)}
          </p>
        </div>
        <div className="bg-slate-100 rounded-xl p-4">
          <p className="text-sm text-slate-600 font-medium">Sparquote</p>
          <p className="text-2xl font-bold text-slate-700">
            {(monthlySummary.savingsRate * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Ausgaben nach Kategorie"
            subtitle={formatMonth(selectedMonth + '-01')}
          />
          {expenseCategories.length > 0 ? (
            <CategoryPie data={expenseCategories} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              Keine Ausgaben in diesem Monat
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Einnahmen nach Kategorie"
            subtitle={formatMonth(selectedMonth + '-01')}
          />
          {incomeCategories.length > 0 ? (
            <CategoryPie data={incomeCategories} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              Keine Einnahmen in diesem Monat
            </div>
          )}
        </Card>
      </div>

      {/* Budget vs Actual */}
      <Card>
        <CardHeader
          title="Budget vs. Tatsächlich"
          subtitle={formatMonth(selectedMonth + '-01')}
          action={
            <Button
              size="sm"
              onClick={() => {
                setEditingBudget(null);
                setShowBudgetModal(true);
              }}
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Budget hinzufügen
            </Button>
          }
        />
        {budgets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                    Kategorie
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">
                    Budget
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">
                    Ausgegeben
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">
                    Differenz
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                    Fortschritt
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budgets.map((budget) => {
                  const spent = expenseByCategory[budget.category] || 0;
                  const diff = budget.budgetAmount - spent;
                  const percentage = Math.min(
                    (spent / budget.budgetAmount) * 100,
                    100
                  );
                  const isOverBudget = spent > budget.budgetAmount;

                  return (
                    <tr key={budget.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {budget.category}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 text-right">
                        {formatCurrency(budget.budgetAmount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">
                        {formatCurrency(spent)}
                      </td>
                      <td
                        className={classNames(
                          'px-4 py-3 text-sm text-right font-medium',
                          isOverBudget ? 'text-red-600' : 'text-green-600'
                        )}
                      >
                        {isOverBudget ? '-' : '+'}
                        {formatCurrency(Math.abs(diff))}
                      </td>
                      <td className="px-4 py-3 w-40">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={classNames(
                                'h-full rounded-full transition-all',
                                isOverBudget ? 'bg-red-500' : 'bg-green-500'
                              )}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-10 text-right">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleEditBudget(budget)}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                            title="Bearbeiten"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBudget(budget.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                            title="Löschen"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p>Keine Budgets für diesen Monat definiert</p>
            <Button
              size="sm"
              className="mt-4"
              onClick={() => {
                setEditingBudget(null);
                setShowBudgetModal(true);
              }}
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Erstes Budget erstellen
            </Button>
          </div>
        )}
      </Card>

      {/* Budget Modal */}
      <Modal
        isOpen={showBudgetModal}
        onClose={() => {
          setShowBudgetModal(false);
          setEditingBudget(null);
        }}
        title={editingBudget ? 'Budget bearbeiten' : 'Neues Budget'}
      >
        <BudgetForm
          onSave={handleSaveBudget}
          onCancel={() => {
            setShowBudgetModal(false);
            setEditingBudget(null);
          }}
          initialData={editingBudget}
          existingCategories={existingBudgetCategories}
        />
      </Modal>

      {/* Category Breakdown */}
      <Card>
        <CardHeader title="Alle Ausgaben nach Kategorie" />
        <div className="space-y-3">
          {expenseCategories.map(({ category, amount }) => {
            const percentage =
              monthlySummary.expenses > 0
                ? (amount / monthlySummary.expenses) * 100
                : 0;
            return (
              <div key={category} className="flex items-center gap-4">
                <div className="w-32 text-sm text-slate-700">{category}</div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-24 text-sm text-slate-900 text-right font-medium">
                  {formatCurrency(amount)}
                </div>
                <div className="w-16 text-sm text-slate-500 text-right">
                  {percentage.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
