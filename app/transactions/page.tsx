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
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/lib/utils';

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
    };
  }, [filterType, filterCategory, filterAccount, debouncedSearch]);

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
  } = useTransactions({ mode: 'page', filters, pageSize: 50 });

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
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Filter zurücksetzen
            </Button>
          </div>
        </Card>
      )}

      {/* Transactions Table */}
      <Card padding="none">
        <TransactionTable
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
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
