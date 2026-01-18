'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import TransactionModal from '@/components/TransactionModal';
import TransactionTable from '@/components/TransactionTable';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES, ACCOUNTS } from '@/lib/types';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/lib/utils';

export default function TransactionsPage() {
  const {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      if (filterAccount !== 'all' && t.account !== filterAccount) return false;
      if (
        filterSearch &&
        !t.note.toLowerCase().includes(filterSearch.toLowerCase()) &&
        !t.category.toLowerCase().includes(filterSearch.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [transactions, filterType, filterCategory, filterAccount, filterSearch]);

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transaktionen</h1>
          <p className="text-slate-500 mt-1">
            {filteredTransactions.length} von {transactions.length} Transaktionen
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Neue Transaktion
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-sm text-green-600 font-medium">Einnahmen</p>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-sm text-red-600 font-medium">Ausgaben</p>
          <p className="text-2xl font-bold text-red-700">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div className="bg-indigo-50 rounded-xl p-4">
          <p className="text-sm text-indigo-600 font-medium">Netto</p>
          <p className="text-2xl font-bold text-indigo-700">
            {formatCurrency(totalIncome - totalExpenses)}
          </p>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          transactions={filteredTransactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

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
