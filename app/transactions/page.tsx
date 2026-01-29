'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import TransactionModal from '@/components/TransactionModal';
import TransactionTable from '@/components/TransactionTable';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES, ACCOUNTS } from '@/lib/types';
import {
  PlusIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TrashIcon,
  XMarkIcon,
  Bars3BottomLeftIcon
} from '@heroicons/react/24/outline';
import { formatCurrency, exportToCSV, getDateGroup, type DateGroup } from '@/lib/utils';

export default function TransactionsPage() {
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Sorting
  type SortField = 'dateISO' | 'amount' | 'category';
  const [sortField, setSortField] = useState<SortField>('dateISO');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Grouping
  const [showGrouping, setShowGrouping] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filterSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [filterSearch]);

  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  const filters = useMemo(() => {
    return {
      type: filterType === 'all' ? undefined : filterType,
      category: filterCategory === 'all' ? undefined : filterCategory,
      account: filterAccount === 'all' ? undefined : filterAccount,
      search: debouncedSearch || undefined,
      startDateISO: filterStartDate || undefined,
      endDateISO: filterEndDate || undefined,
    };
  }, [filterType, filterCategory, filterAccount, debouncedSearch, filterStartDate, filterEndDate]);

  const {
    transactions,
    isLoading,
    isLoadingMore,
    totalCount,
    hasMore,
    loadMore,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteTransactionsBulk,
  } = useTransactions({ mode: 'page', filters, pageSize: 50 });

  // Client-side sorting
  const sortedTransactions = useMemo(() => {
    const sorted = [...transactions];
    sorted.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'dateISO') {
        comparison = a.dateISO.localeCompare(b.dateISO);
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'category') {
        comparison = a.category.localeCompare(b.category);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [transactions, sortField, sortDirection]);

  // Grouped transactions
  const groupedTransactions = useMemo(() => {
    if (!showGrouping) return null;
    const groups: Record<DateGroup, Transaction[]> = {
      'heute': [],
      'gestern': [],
      'diese-woche': [],
      'dieser-monat': [],
      'aelter': [],
    };
    for (const t of sortedTransactions) {
      const group = getDateGroup(t.dateISO);
      groups[group].push(t);
    }
    return groups;
  }, [sortedTransactions, showGrouping]);

  let totalIncome = 0;
  let totalExpenses = 0;
  for (const transaction of transactions) {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount;
    } else {
      totalExpenses += transaction.amount;
    }
  }

  const handleSave = (transactionData: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      updateTransaction({ ...transactionData, id: editingTransaction.id });
    } else {
      addTransaction(transactionData);
    }
    setEditingTransaction(null);
    setIsModalOpen(false);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Möchten Sie diese Transaktion wirklich löschen?')) {
      deleteTransaction(id);
    }
  };

  const resetFilters = () => {
    setFilterType('all');
    setFilterCategory('all');
    setFilterAccount('all');
    setFilterSearch('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  // Quick date filters
  const setQuickDateFilter = (type: 'today' | 'week' | 'month') => {
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];

    if (type === 'today') {
      setFilterStartDate(todayISO);
      setFilterEndDate(todayISO);
    } else if (type === 'week') {
      const day = today.getDay();
      const diff = day === 0 ? 6 : day - 1; // Monday = 0
      const monday = new Date(today);
      monday.setDate(today.getDate() - diff);
      setFilterStartDate(monday.toISOString().split('T')[0]);
      setFilterEndDate(todayISO);
    } else if (type === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setFilterStartDate(firstDay.toISOString().split('T')[0]);
      setFilterEndDate(todayISO);
    }
  };

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Selection handlers
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedTransactions.map((t) => t.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Möchten Sie ${selectedIds.size} Transaktionen wirklich löschen?`)) return;

    setIsDeleting(true);
    const success = await deleteTransactionsBulk(Array.from(selectedIds));
    if (success) {
      setSelectedIds(new Set());
    }
    setIsDeleting(false);
  };

  // CSV Export
  const handleExport = () => {
    exportToCSV(sortedTransactions, 'transaktionen.csv');
  };

  if (!mounted || isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="h-96 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Transaktionen</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {transactions.length} von {totalCount} Transaktionen
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowGrouping(!showGrouping)}
            className="flex-1 sm:flex-none"
            title="Gruppierung"
          >
            <Bars3BottomLeftIcon className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Gruppieren</span>
          </Button>
          <Button
            variant="secondary"
            onClick={handleExport}
            className="flex-1 sm:flex-none"
            title="Als CSV exportieren"
          >
            <ArrowDownTrayIcon className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1 sm:flex-none"
          >
            <FunnelIcon className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none">
            <PlusIcon className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Neue Transaktion</span>
            <span className="sm:hidden">Neu</span>
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-green-50 rounded-xl p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-green-600 font-medium">Einnahmen</p>
          <p className="text-lg sm:text-2xl font-bold text-green-700 truncate">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-red-600 font-medium">Ausgaben</p>
          <p className="text-lg sm:text-2xl font-bold text-red-700 truncate">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div className="bg-indigo-50 rounded-xl p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-indigo-600 font-medium">Netto</p>
          <p className="text-lg sm:text-2xl font-bold text-indigo-700 truncate">
            {formatCurrency(totalIncome - totalExpenses)}
          </p>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Select
              label="Typ"
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as 'all' | 'income' | 'expense')
              }
              options={[
                { value: 'all', label: 'Alle' },
                { value: 'income', label: 'Einnahmen' },
                { value: 'expense', label: 'Ausgaben' },
              ]}
            />
            <Select
              label="Kategorie"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              options={[
                { value: 'all', label: 'Alle Kategorien' },
                ...allCategories.map((cat) => ({ value: cat, label: cat })),
              ]}
            />
            <Select
              label="Konto"
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              options={[
                { value: 'all', label: 'Alle Konten' },
                ...ACCOUNTS.map((acc) => ({ value: acc, label: acc })),
              ]}
            />
            <Input
              label="Suche"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Notiz oder Kategorie..."
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4">
            <Input
              label="Von"
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
            <Input
              label="Bis"
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
            />
            <div className="col-span-2 flex items-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuickDateFilter('today')}
              >
                Heute
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuickDateFilter('week')}
              >
                Diese Woche
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuickDateFilter('month')}
              >
                Dieser Monat
              </Button>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Filter zurücksetzen
            </Button>
          </div>
        </Card>
      )}

      {/* Bulk Selection Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-4 z-50">
          <span className="text-sm">
            {selectedIds.size} ausgewählt
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white border-0"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            {isDeleting ? 'Lösche...' : 'Löschen'}
          </Button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="p-1 hover:bg-slate-700 rounded"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Transactions Table */}
      <Card padding="none">
        <TransactionTable
          transactions={sortedTransactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          selectedIds={selectedIds}
          onToggleSelection={toggleSelection}
          onToggleSelectAll={toggleSelectAll}
          groupedTransactions={groupedTransactions}
          showGrouping={showGrouping}
        />
      </Card>
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            onClick={loadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Lade...' : 'Mehr laden'}
          </Button>
        </div>
      )}

      {/* Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSave}
        editTransaction={editingTransaction}
      />
    </div>
  );
}
